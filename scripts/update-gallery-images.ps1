param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$photosDir = Join-Path $ProjectRoot "Photos"
$mainJsPath = Join-Path $ProjectRoot "js/main.js"

if (-not (Test-Path $photosDir)) {
  throw "Dossier Photos introuvable: $photosDir"
}

if (-not (Test-Path $mainJsPath)) {
  throw "Fichier introuvable: $mainJsPath"
}

$rootUri = [System.Uri]((Resolve-Path $ProjectRoot).Path + [System.IO.Path]::DirectorySeparatorChar)

$images = Get-ChildItem -Path $photosDir -Recurse -File |
  Where-Object { $_.Extension -match '^(?i)\.(jpg|jpeg|png|webp)$' } |
  Sort-Object FullName |
  ForEach-Object {
    $fileUri = [System.Uri]((Resolve-Path $_.FullName).Path)
    [System.Uri]::UnescapeDataString($rootUri.MakeRelativeUri($fileUri).ToString())
  }

if ($images.Count -eq 0) {
  throw "Aucune image trouvee dans Photos"
}

$escaped = $images | ForEach-Object {
  '  "' + ($_.Replace('"', '\\"')) + '"'
}

$galleryArray = "const galleryImages = [`n" + ($escaped -join ",`n") + "`n];"

$content = Get-Content -Path $mainJsPath -Raw
$pattern = 'const galleryImages = \[(.|\r|\n)*?\];'

if ($content -notmatch $pattern) {
  throw "Bloc galleryImages introuvable dans js/main.js"
}

$newContent = [regex]::Replace($content, $pattern, $galleryArray, 1)
Set-Content -Path $mainJsPath -Value $newContent -Encoding UTF8

Write-Host ("Mise a jour OK: {0} images" -f $images.Count)
