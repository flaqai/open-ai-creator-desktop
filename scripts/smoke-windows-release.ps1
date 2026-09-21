param(
  [Parameter(Mandatory = $true)][string]$Installer,
  [Parameter(Mandatory = $true)][string]$Version
)

$ErrorActionPreference = 'Stop'

function Assert-X64Executable([string]$Path) {
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $reader = [System.IO.BinaryReader]::new($stream)
    if ($reader.ReadUInt16() -ne 0x5A4D) { throw "Not a PE executable: $Path" }
    $stream.Position = 0x3C
    $peOffset = $reader.ReadInt32()
    $stream.Position = $peOffset
    if ($reader.ReadUInt32() -ne 0x00004550) { throw "Invalid PE header: $Path" }
    $machine = $reader.ReadUInt16()
    if ($machine -ne 0x8664) { throw "Expected x64 PE machine 0x8664, found 0x$($machine.ToString('X4')): $Path" }
  } finally {
    $stream.Dispose()
  }
}

function Find-FlaqExecutable([string]$Root) {
  $matches = @(Get-ChildItem -Path $Root -Filter '*.exe' -File -Recurse | Where-Object {
    $_.Name -notmatch '^uninstall' -and $_.VersionInfo.ProductName -eq 'Flaq Creator'
  })
  if ($matches.Count -ne 1) { throw "Expected exactly one Flaq Creator executable below $Root, found $($matches.Count)." }
  return $matches[0]
}

function Assert-AppExecutable($File) {
  Assert-X64Executable $File.FullName
  if (-not $File.VersionInfo.ProductVersion.StartsWith($Version)) {
    throw "Unexpected application version $($File.VersionInfo.ProductVersion), expected $Version."
  }
}

$root = Join-Path $env:RUNNER_TEMP "flaq-release-smoke-$PID"
$installRoot = Join-Path $root 'nsis-install'
$process = $null
$uninstaller = $null

try {
  New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
  $install = Start-Process -FilePath (Resolve-Path $Installer) -ArgumentList @('/S', "/D=$installRoot") -Wait -PassThru
  if ($install.ExitCode -ne 0) { throw "NSIS installer exited with $($install.ExitCode)." }
  $app = Find-FlaqExecutable $installRoot
  Assert-AppExecutable $app

  $oldAppData = $env:APPDATA
  $oldLocalAppData = $env:LOCALAPPDATA
  $env:APPDATA = Join-Path $root 'appdata'
  $env:LOCALAPPDATA = Join-Path $root 'localappdata'
  try {
    $process = Start-Process -FilePath $app.FullName -PassThru
    Start-Sleep -Seconds 8
    if ($process.HasExited) { throw "Installed application exited during smoke with $($process.ExitCode)." }
  } finally {
    if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force }
    $env:APPDATA = $oldAppData
    $env:LOCALAPPDATA = $oldLocalAppData
  }

  $uninstallers = @(Get-ChildItem -Path $installRoot -Filter 'uninstall*.exe' -File -Recurse)
  if ($uninstallers.Count -eq 1) { $uninstaller = $uninstallers[0].FullName }

  Write-Host "PASS Windows package: $Version, x64, NSIS install/start/uninstall."
} finally {
  if ($null -ne $uninstaller -and (Test-Path $uninstaller)) {
    Start-Process -FilePath $uninstaller -ArgumentList '/S' -Wait | Out-Null
  }
  if (Test-Path $root) { Remove-Item -Path $root -Recurse -Force -ErrorAction SilentlyContinue }
}
