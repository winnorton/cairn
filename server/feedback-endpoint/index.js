import express from 'express';
import { Octokit } from '@octokit/rest';
import { sanitize } from './sanitize.js';

const PORT = process.env.PORT || 8080;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'winnorton/cairn';

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN env var is required. See README.md.');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPO.split('/');
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const VALID_CATEGORIES = ['gap', 'bug', 'skill-idea', 'clarification', 'docs', 'design'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 2;
const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const bucket = (rateLimitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.length >= RATE_LIMIT_MAX) return false;
  bucket.push(now);
  rateLimitMap.set(ip, bucket);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitMap.entries()) {
    const fresh = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (fresh.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, fresh);
  }
}, 60_000).unref();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
}

const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({
    service: 'cairn-feedback-endpoint',
    repo: `https://github.com/${GITHUB_REPO}`,
    usage: 'POST /feedback with JSON { category, severity, title, body, context?, cairn_version?, environment? }',
    docs: 'https://github.com/winnorton/cairn/blob/main/server/feedback-endpoint/README.md',
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/feedback', async (req, res) => {
  const ip = clientIp(req);

  if (!rateLimit(ip)) {
    return res.status(429).json({
      error: 'rate_limited',
      retry_strategy: 'wait 60 seconds, then retry; or use paste fallback to file the issue manually',
    });
  }

  const { category, severity, title, body, context, cairn_version, environment } = req.body || {};

  if (!category || !severity || !title || !body) {
    return res.status(400).json({
      error: 'invalid_payload',
      retry_strategy: 'ensure category, severity, title, and body are all non-empty strings',
    });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: 'invalid_category',
      retry_strategy: `valid categories: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  if (!VALID_SEVERITIES.includes(severity)) {
    return res.status(400).json({
      error: 'invalid_severity',
      retry_strategy: `valid severities: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  if (title.length > 120) {
    return res.status(400).json({
      error: 'title_too_long',
      retry_strategy: 'title must be 120 characters or fewer',
    });
  }

  if (body.length > 20_000) {
    return res.status(400).json({
      error: 'body_too_long',
      retry_strategy: 'body must be 20000 characters or fewer',
    });
  }

  const cleanBody = sanitize(body);
  const cleanContext = context ? sanitize(String(context)) : '';
  const version = cairn_version ? sanitize(String(cairn_version)) : 'unknown';
  const env = environment ? sanitize(String(environment)) : 'unknown';

  const issueBody = [
    `**Category:** ${category}`,
    `**Severity:** ${severity}`,
    `**Cairn version:** ${version}`,
    `**Environment:** ${env}`,
    '',
    cleanBody,
    '',
    cleanContext ? `## Additional context\n\n${cleanContext}\n` : '',
    '---',
    '_Filed via the cairn feedback endpoint (https://cairn.winnorton.com). IP not logged in issue._',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await octokit.issues.create({
      owner,
      repo,
      title: sanitize(title),
      body: issueBody,
      labels: ['agent-filed', category, severity],
    });

    console.log(`Filed issue ${response.data.number} for ${category}/${severity}: ${response.data.html_url}`);

    return res.json({
      issue_url: response.data.html_url,
      issue_number: response.data.number,
    });
  } catch (err) {
    console.error('GitHub API error:', err.status, err.message);

    if (err.status === 403 || err.status === 401) {
      return res.status(502).json({
        error: 'github_auth_failed',
        retry_strategy: 'endpoint token is misconfigured; use paste fallback and notify the maintainer',
      });
    }

    return res.status(502).json({
      error: 'github_api_failed',
      retry_strategy: 'GitHub issue creation failed; retry once or use paste fallback',
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'payload_too_large',
      retry_strategy: 'request body exceeds 100kb; trim context and retry',
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'invalid_json',
      retry_strategy: 'send Content-Type: application/json with a valid JSON body',
    });
  }
  return res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`cairn feedback endpoint listening on :${PORT} (repo: ${GITHUB_REPO})`);
});
