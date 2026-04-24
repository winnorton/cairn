# cairn feedback endpoint

HTTP endpoint that accepts structured feedback from cairn-adopting agents and files
GitHub issues against `winnorton/cairn`. Designed for Google Cloud Run.

When an agent invokes cairn's `/feedback` skill, it POSTs here first. This endpoint is
the primary delivery path; `gh issue create` and user-paste-fallback remain as graceful
degradations.

## API

```
POST /feedback
Content-Type: application/json

{
  "category":      "gap | bug | skill-idea | clarification | docs | design",
  "severity":      "low | medium | high",
  "title":         "<short title, <= 120 chars>",
  "body":          "<markdown body, <= 20000 chars>",
  "context":       "<optional additional context>",
  "cairn_version": "<e.g. 0.6.0>",
  "environment":   "<e.g. Cowork, Claude Code, claude.ai>"
}
```

**Responses:**

- `200 { "issue_url": "...", "issue_number": N }` — filed successfully.
- `400 { "error": "...", "retry_strategy": "..." }` — payload invalid.
- `429 { "error": "rate_limited", "retry_strategy": "..." }` — wait or use paste fallback.
- `502 { "error": "...", "retry_strategy": "..." }` — GitHub API call failed.

Rate limit: 2 requests per 60 seconds per IP (in-memory).

## Deploy to Google Cloud Run

### Prerequisites

- `gcloud` CLI installed and authenticated — `gcloud auth login`.
- A GCP project with billing enabled.
- The target GCP region you want (we'll use `us-central1` in the example below).
- A GitHub personal access token with `issues:write` on `winnorton/cairn`
  ([create one here](https://github.com/settings/personal-access-tokens/new)).
  **Fine-grained token** scoped to the cairn repo is recommended.

### Step 1 — Store the token in Secret Manager

```bash
PROJECT_ID=<your-gcp-project>
gcloud config set project "$PROJECT_ID"

# Enable required APIs (idempotent)
gcloud services enable run.googleapis.com secretmanager.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com

# Create the secret
printf '%s' '<paste-github-token-here>' | \
  gcloud secrets create cairn-github-token --data-file=-
```

### Step 2 — Deploy from source

From `server/feedback-endpoint/`:

```bash
gcloud run deploy cairn-feedback \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GITHUB_TOKEN=cairn-github-token:latest \
  --set-env-vars GITHUB_REPO=winnorton/cairn \
  --min-instances 0 \
  --max-instances 5 \
  --memory 256Mi \
  --cpu 1 \
  --timeout 30s
```

Cloud Run's Node.js buildpack will detect `package.json`, run `npm install`, and start
`node index.js`. Note the service URL printed at the end — something like
`https://cairn-feedback-<hash>-uc.a.run.app`.

### Step 3 — Smoke test

```bash
curl -sS https://<service-url>/health
# → {"ok":true}

curl -sS -X POST https://<service-url>/feedback \
  -H 'Content-Type: application/json' \
  -d '{
    "category": "docs",
    "severity": "low",
    "title": "Feedback endpoint deployment test",
    "body": "Ignore — smoke test of the newly-deployed endpoint.",
    "cairn_version": "0.6.0",
    "environment": "deployment-test"
  }'
# → {"issue_url":"https://github.com/winnorton/cairn/issues/N","issue_number":N}
```

If you see an issue appear on the repo, the endpoint is live. Close the test issue
after confirming.

### Step 4 — Map the custom domain `cairn.winnorton.com`

```bash
gcloud beta run domain-mappings create \
  --service cairn-feedback \
  --domain cairn.winnorton.com \
  --region us-central1
```

The command will print DNS records you need to add at your domain registrar (typically
one or more `A`/`AAAA` records or a `CNAME`). After the DNS propagates (minutes to
hours) and the Google-managed TLS cert provisions, `https://cairn.winnorton.com/feedback`
will route to the service.

Verify:

```bash
curl -sS https://cairn.winnorton.com/health
# → {"ok":true}
```

## Local development

```bash
cd server/feedback-endpoint
cp .env.example .env
# Put a real GITHUB_TOKEN in .env
npm install
node --env-file=.env index.js
```

Then POST to `http://localhost:8080/feedback`.

## Operations

- **Logs:** `gcloud run services logs read cairn-feedback --region us-central1`.
- **Update:** rerun the `gcloud run deploy` command from Step 2 — Cloud Run rebuilds and
  rolls out a new revision with zero-downtime traffic switch.
- **Rotate token:** update the Secret Manager secret to a new version, then redeploy.
- **Cost:** with `min-instances 0`, the service scales to zero when idle. Expected cost
  for low-volume feedback: well under $1/month.

## Security posture

- **Public unauthenticated endpoint by design.** Anyone can POST. Rate limiting +
  issue-visibility-on-public-repo is the abuse defense. Abuse patterns are easy to spot
  and block at the Cloud Run level if they appear.
- **PII sanitization** is best-effort (see `sanitize.js`). Agents should pre-sanitize.
- **No secrets logged.** Incoming payloads are not written to logs beyond the filed
  issue itself.
- **Revocation:** the GitHub token can be revoked at any time in GitHub settings. The
  service will start returning 502s; agents will fall back to `gh` CLI or paste.
