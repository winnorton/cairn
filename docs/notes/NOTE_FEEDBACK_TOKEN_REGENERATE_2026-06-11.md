# NOTE: regenerate the GitHub token the /feedback feature requires

> Filed: 2026-06-11 · By: agent (per user request) · Status: open · TODO action

## The task

The cairn `/feedback` skill posts to a Cloud Run endpoint
(`https://cairn-feedback-591252228833.us-central1.run.app/feedback`,
fallback `https://cairn.winnorton.com/feedback`) which uses a GitHub PAT
to create issues on `winnorton/cairn`. **That PAT needs regenerating** —
Fable's submission on 2026-06-11 (the `/program` SKILL.md `§5/§8` drift
finding) was denied at the endpoint, consistent with an expired or
revoked token rather than a Fable-side problem.

## Where to look

- Cloud Run service: `cairn-feedback-591252228833` (project: configured
  per manifest.json's `endpoints.feedback.urls[0]`)
- The PAT lives as a secret env var on that service (GCP Secret Manager
  → Cloud Run revision env binding). Whatever name was given to the
  secret when the service was first deployed.
- GitHub PAT settings: https://github.com/settings/tokens — find the
  cairn-feedback token, regenerate. Required scopes — at minimum
  `public_repo` (for issue creation on the public winnorton/cairn repo);
  `issues:write` if using fine-grained tokens.

## What "done" looks like

A fresh `/feedback` POST from any cairn-adopted agent succeeds and
returns the created issue URL. Quick verification —

```bash
curl -X POST https://cairn-feedback-591252228833.us-central1.run.app/feedback \
  -H "Content-Type: application/json" \
  -d '{"category":"docs","severity":"low","title":"token-regenerate verification","body":"please ignore, smoke test after PAT rotation"}'
```

Expect `200` with an issue URL in the response body. Then delete the
verification issue from the GitHub UI.

## Why this matters

`/feedback` is one of the three fallback paths the skill documents
(endpoint → `gh issue create` → user-paste). With the endpoint down,
the skill silently drops to fallback (or, as in Fable's case today,
denies entirely if the agent lacks `gh` CLI). Adopted-agents lose
their cheapest filing path.

## Related

- Manifest entry: [manifest.json](../../manifest.json) `endpoints.feedback`
- Feedback skill: [files/skills/feedback/SKILL.md](../../files/skills/feedback/SKILL.md)
- Endpoint repo: `server/feedback-endpoint/` (per manifest.json docs link)

---

*Note — pre-emptive intent capture. If this becomes real work, promote to
`/spec --from` (probably overkill for a token rotation — direct action is
the right shape).*
