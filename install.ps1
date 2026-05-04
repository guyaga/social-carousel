# social-carousel one-line installer (Windows PowerShell)
$ErrorActionPreference = "Stop"

$Dest = Join-Path $env:USERPROFILE ".claude\skills\social-carousel"

if (Test-Path $Dest) {
  Write-Host "-> social-carousel already installed at $Dest. Pulling latest..."
  git -C $Dest pull --ff-only
} else {
  Write-Host "-> Cloning social-carousel to $Dest..."
  git clone https://github.com/guyaga/social-carousel $Dest
}

Write-Host "-> Installing dependencies..."
npm install --prefix $Dest

Write-Host "-> Running setup..."
node "$Dest\setup.mjs"

Write-Host ""
Write-Host "OK social-carousel installed."
Write-Host "  Generate a carousel:  node $Dest\cli.mjs"
