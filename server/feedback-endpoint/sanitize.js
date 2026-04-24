// Light PII/secret redaction. Best-effort, not bulletproof — agents should also
// sanitize upstream before POSTing. The goal is to catch common accidents
// (copy-pasted paths, tokens) before they land in a public issue.

const PATTERNS = [
  { re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, replacement: '<email-redacted>' },

  { re: /[A-Z]:[\\/]Users[\\/][^\s\\/"'`]+/g, replacement: 'C:\\Users\\<user>' },
  { re: /\/home\/[A-Za-z0-9._-]+/g, replacement: '/home/<user>' },
  { re: /\/Users\/[A-Za-z0-9._-]+/g, replacement: '/Users/<user>' },

  { re: /gh[oprsu]_[A-Za-z0-9]{20,}/g, replacement: '<github-token-redacted>' },
  { re: /sk-[A-Za-z0-9]{32,}/g, replacement: '<api-key-redacted>' },
  { re: /AKIA[0-9A-Z]{16}/g, replacement: '<aws-access-key-redacted>' },

  { re: /\b(?:AAA|QUU|AIza|Bearer )[A-Za-z0-9_-]{20,}/g, replacement: '<credential-redacted>' },
];

export function sanitize(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text;
  for (const { re, replacement } of PATTERNS) {
    cleaned = cleaned.replace(re, replacement);
  }
  return cleaned;
}
