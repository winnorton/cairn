# cairn-integrity.ps1 — install-integrity check for a .cairn/ habitat
# Usage: pwsh scripts/cairn-integrity.ps1 [-ProjectRoot <path>]
# Exits 0 if healthy, 1 if any check fails.
param(
  [string]$ProjectRoot = "."
)

$cairnDir = Join-Path $ProjectRoot ".cairn"
$contextFile = Join-Path $ProjectRoot "CLAUDE.md"
$agentsFile = Join-Path $ProjectRoot "AGENTS.md"
$pass = $true

function Check($desc, $ok, $detail = "") {
  if ($ok) { Write-Host "OK:   $desc" }
  else { Write-Host "FAIL: $desc$(if ($detail) { ' — ' + $detail })"; $script:pass = $false }
}

# 1. .cairn/ exists
Check ".cairn/ directory exists" (Test-Path $cairnDir) "not found"

# 2. Required files present
foreach ($f in @("CLAUDE.md", "LAWS.md", "cairn-version", "memory\MEMORY.md")) {
  Check ".cairn\$f present" (Test-Path (Join-Path $cairnDir $f)) "missing"
}

# 3. No file is empty or HTTP error body
Get-ChildItem -Recurse $cairnDir -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
  $first = Get-Content $_.FullName -TotalCount 1 -ErrorAction SilentlyContinue
  if ($first -match "^404|^Not Found|^<!DOCTYPE|^<html") { Check $_.Name $false "corrupt: $first" }
  elseif (-not $first) { Check $_.Name $false "empty" }
}

# 4. Import line present
if (Test-Path $contextFile) {
  Check "import line in CLAUDE.md" (Select-String -Path $contextFile -Pattern "@./\.cairn/CLAUDE\.md" -Quiet) `
    "MISSING — add: @./.cairn/CLAUDE.md"
} elseif (Test-Path $agentsFile) {
  Check "import line in AGENTS.md" (Select-String -Path $agentsFile -Pattern "\.cairn/CLAUDE\.md" -Quiet) `
    "MISSING — add line referencing .cairn/CLAUDE.md"
} else {
  Check "context file (CLAUDE.md or AGENTS.md)" $false "neither found"
}

# 5. cairn-version marker
$verFile = Join-Path $cairnDir "cairn-version"
if (Test-Path $verFile) {
  $ver = Get-Content $verFile -TotalCount 1
  Check "cairn-version marker ($ver)" $true
} else {
  Check "cairn-version marker" $false "missing — run adopt or migration Phase A3"
}

Write-Host ""
if ($pass) { Write-Host "cairn habitat: HEALTHY"; exit 0 }
else { Write-Host "cairn habitat: NEEDS ATTENTION (see FAIL lines above)"; exit 1 }
