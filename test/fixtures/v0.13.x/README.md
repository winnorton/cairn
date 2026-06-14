# test/fixtures/v0.13.x

Committed snapshot of a representative v0.13.1 install layout. Used by WS09 migration
smoke test (Phase 4 of SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md).

Layout mapping (dir names avoid `.claude/`, which `.gitignore` excludes — so the
fixture actually commits and the smoke test is reproducible on a clean clone):
  project-dotclaude/ → <project>/.claude/  (LAWS.md, cairn-version)
  home-claude/       → ~/.claude/          (memory/, skills/)

This fixture is representative, not minimal:
  - MEMORY.md with entries in 2 typed subdirs (feedback/, project/)
  - 2 typed memory entry files with frontmatter
  - 2 skill subdirs with valid SKILL.md frontmatter

Do NOT expand this fixture without updating the smoke test in Phase 4.
