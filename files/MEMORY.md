<!--
  Memory index — one-line pointers to memory files in this directory.
  Each entry: - [Title](filename.md) — one-line hook

  Entries are loaded into every conversation. Keep under ~150 chars per line.
  Memory files themselves hold the content, structured with frontmatter:

  ---
  name: <short name>
  description: <one-line description used to decide relevance>
  type: user | feedback | project | reference
  ---

  <body>

  Citation convention: when an agent applies a memory, cite inline as [MEM <name>]
  (e.g. [MEM user_role]). This feeds /audit and /prune with real usage signal so
  uncited-over-time entries can be surfaced for review. Noise is acceptable; the
  signal is what powers the pruning loop.
-->
