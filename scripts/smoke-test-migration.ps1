# smoke-test-migration.ps1 — Phase 4 smoke test for WS09
# Runs against test/fixtures/v0.13.x/ to validate the migration flow
# Usage: pwsh scripts/smoke-test-migration.ps1 (run from repo root)
param(
  [string]$RepoRoot = "."
)

$fixturePath = Join-Path $RepoRoot "test\fixtures\v0.13.x"
$cairnSourceClaude = Join-Path $RepoRoot "files\.cairn\CLAUDE.md"

# STEP 4.1 - Set up temp working directory
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory $tmp | Out-Null
Write-Host "Smoke test dir: $tmp"

try {
  # Copy fixture into temp as if it were a real install
  New-Item -ItemType Directory -Force "$tmp\.cairn" | Out-Null
  New-Item -ItemType Directory -Force "$tmp\.claude" | Out-Null
  Copy-Item -Recurse "$fixturePath\.claude\*" "$tmp\.claude\"
  $homeSimulated = New-Item -ItemType Directory -Force "$tmp\simulated-home-claude"
  Copy-Item -Recurse "$fixturePath\home-claude\*" "$homeSimulated\"

  # STEP 4.2 - Run Phase A copy steps against fixture
  New-Item -ItemType Directory -Force "$tmp\.cairn\memory\feedback" | Out-Null
  New-Item -ItemType Directory -Force "$tmp\.cairn\memory\project" | Out-Null
  New-Item -ItemType Directory -Force "$tmp\.cairn\memory\reference" | Out-Null
  New-Item -ItemType Directory -Force "$tmp\.cairn\memory\user" | Out-Null
  New-Item -ItemType Directory -Force "$tmp\.cairn\context" | Out-Null

  # A2: copy LAWS.md
  Copy-Item "$tmp\.claude\LAWS.md" "$tmp\.cairn\LAWS.md"

  # A3: copy cairn-version
  Copy-Item "$tmp\.claude\cairn-version" "$tmp\.cairn\cairn-version"

  # A4: copy memory (simulated home-claude is the source)
  Copy-Item -Recurse "$homeSimulated\memory\*" "$tmp\.cairn\memory\" -Force

  # A5: use the real CLAUDE.md from source tree instead of fetching
  Copy-Item $cairnSourceClaude "$tmp\.cairn\CLAUDE.md"

  Write-Host "Phase A steps complete"

  # STEP 4.3 - Run Phase B verification against fixture result
  $pass = $true
  foreach ($f in @(".cairn\CLAUDE.md", ".cairn\LAWS.md", ".cairn\cairn-version", ".cairn\memory\MEMORY.md")) {
    if (Test-Path "$tmp\$f") { Write-Host "OK: $f" } else { Write-Host "MISSING: $f"; $pass = $false }
  }
  # content check
  Get-ChildItem -Recurse "$tmp\.cairn" -File | ForEach-Object {
    $first = Get-Content $_.FullName -TotalCount 1
    if ($first -match "^404|^Not Found|^<!DOCTYPE|^<html") { Write-Host "CORRUPT: $($_.FullName)"; $pass = $false }
  }
  # MEMORY.md index integrity
  $memIndex = Get-Content "$tmp\.cairn\memory\MEMORY.md" -Raw
  $refs = [regex]::Matches($memIndex, '\(([^)]+\.md)\)') | ForEach-Object { $_.Groups[1].Value }
  foreach ($ref in $refs) {
    $full = Join-Path "$tmp\.cairn\memory" $ref
    if (Test-Path $full) { Write-Host "OK: $ref" } else { Write-Host "BROKEN-REF: $ref"; $pass = $false }
  }

  # STEP 4.4 - Verify cairn-version fast-path coordination
  $oldVer = Get-Content "$tmp\.claude\cairn-version" -ErrorAction SilentlyContinue
  $newVer = Get-Content "$tmp\.cairn\cairn-version" -ErrorAction SilentlyContinue
  Write-Host "Old marker (.claude/cairn-version): $oldVer"
  Write-Host "New marker (.cairn/cairn-version): $newVer"
  if ($oldVer -eq $newVer) { Write-Host "VERSION MATCH OK" } else { Write-Host "VERSION MISMATCH — check copy step"; $pass = $false }

  if ($pass) { Write-Host ""; Write-Host "SMOKE TEST PASSED" }
  else { Write-Host ""; Write-Host "SMOKE TEST FAILED — see above"; exit 1 }

} finally {
  # STEP 4.5 - Clean up
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  Write-Host "Smoke test temp dir removed."
}
