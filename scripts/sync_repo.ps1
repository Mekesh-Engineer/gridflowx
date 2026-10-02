param (
    [string]$SourceDir = "E:\Projects\Full Stack Project\2026\gridflowx\gridflowx-app1",
    [string]$TargetDir = "E:\Projects\Full Stack Project\2026\gridflowx\gridflowx-app"
)

Write-Host "Syncing from $SourceDir to $TargetDir ..."

# 1. Remove all existing files in TargetDir except .git
Get-ChildItem -Path $TargetDir -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force

# 2. Copy items from SourceDir to TargetDir
$exclude = @('node_modules', '.next', '.venv', '__pycache__', '.pytest_cache', '.agents', '.git')
Get-ChildItem -Path $SourceDir -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $TargetDir -Recurse -Force
}

Write-Host "Sync complete! Checking destination contents:"
Get-ChildItem -Path $TargetDir
