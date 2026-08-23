<#
Usage: Run this script in PowerShell. It will create a GitHub repo (or use existing), add a remote and push the repository.

It requires either:
- environment variable `GITHUB_TOKEN` set to a Personal Access Token with `repo` scope,
or it will prompt you to enter a token securely.

Example:
PS> .\create_and_push.ps1
# Prompts for: GitHub username/org, repo name, and token (if not in env).
# Then it will create the repo and push the current project.
#>

Set-StrictMode -Version Latest

function Read-Token {
    if ($env:GITHUB_TOKEN) {
        return $env:GITHUB_TOKEN
    }
    Write-Host "GITHUB_TOKEN not found in environment. You can create one at https://github.com/settings/tokens (repo scope)."
    $secure = Read-Host -AsSecureString "Enter GitHub Personal Access Token"
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not available in PATH. Install Git and re-run."
    exit 1
}

$owner = Read-Host "GitHub owner (username or org)"
if (-not $owner) { Write-Error "Owner is required"; exit 1 }

$repo = Read-Host "Repository name to create (e.g. my-project)"
if (-not $repo) { Write-Error "Repository name is required"; exit 1 }

$token = Read-Token
if (-not $token) { Write-Error "Token is required"; exit 1 }

# Create repo via API (try user then org)
$headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json' }

Write-Host "Creating repository $owner/$repo (if it doesn't already exist)..."

try {
    $body = @{ name = $repo; private = $true } | ConvertTo-Json
    # If owner is the authenticated user, use /user/repos; if not, try /orgs/{owner}/repos
    $resp = Invoke-RestMethod -Method Post -Uri "https://api.github.com/user/repos" -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Repository created under your user account."
}
catch {
    # Try org creation
    try {
        $resp2 = Invoke-RestMethod -Method Post -Uri "https://api.github.com/orgs/$owner/repos" -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "Repository created under org $owner."
    }
    catch {
        Write-Warning "Could not create repository via API: $($_.Exception.Message)"
        Write-Host "If the repository already exists, the script will try to continue. Otherwise, create the repo manually and press Enter to continue."
        Read-Host "Press Enter to continue"
    }
}

# Ensure git repo
if (-not (Test-Path .git)) {
    git init
    git branch -M main 2>$null || git checkout -b main
}

$remoteUrl = "https://github.com/$owner/$repo.git"

try {
    git remote remove origin 2>$null
} catch { }

git remote add origin $remoteUrl

git add -A
if (-not (git rev-parse --verify HEAD 2>$null)) {
    git commit -m "Initial commit"
} else {
    git commit -m "Update" 2>$null | Out-Null
}

Write-Host "Pushing to $remoteUrl ..."

try {
    git push -u origin main
    Write-Host "Push completed. Repository URL: https://github.com/$owner/$repo"
}
catch {
    Write-Error "Push failed: $($_.Exception.Message)"
    Write-Host "If push failed due to authentication, ensure you have a valid token or set up SSH keys and add the remote as git@github.com:$owner/$repo.git"
}
