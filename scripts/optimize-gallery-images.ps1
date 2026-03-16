param(
  [string]$ProjectRoot = (Get-Location).Path,
  [string]$SourceFolder = "Photos",
  [string]$OutputFolder = "Photos_web",
  [int]$MaxWidth = 1920,
  [int]$MaxHeight = 1920,
  [int]$JpegQuality = 82,
  [switch]$ConvertPngToJpeg,
  [switch]$CleanOutput
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$resolvedProjectRoot = (Resolve-Path $ProjectRoot).Path
$sourceDir = Join-Path $resolvedProjectRoot $SourceFolder
$outputDir = Join-Path $resolvedProjectRoot $OutputFolder

$sourceDir = (Resolve-Path $sourceDir).Path

if (-not (Test-Path $sourceDir)) {
  throw "Dossier source introuvable: $sourceDir"
}

if ($CleanOutput -and (Test-Path $outputDir)) {
  Remove-Item -Path $outputDir -Recurse -Force
}

if (-not (Test-Path $outputDir)) {
  New-Item -Path $outputDir -ItemType Directory | Out-Null
}

function Get-JpegCodec {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1
}

function Save-Jpeg {
  param(
    [System.Drawing.Image]$Image,
    [string]$Path,
    [int]$Quality
  )

  $codec = Get-JpegCodec
  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]$Quality)

  try {
    $Image.Save($Path, $codec, $encoderParams)
  }
  finally {
    $encoderParams.Dispose()
  }
}

function Resize-Image {
  param(
    [string]$SourcePath,
    [string]$DestinationPath,
    [int]$TargetMaxWidth,
    [int]$TargetMaxHeight,
    [int]$Quality,
    [bool]$ForceJpeg
  )

  $srcImage = [System.Drawing.Image]::FromFile($SourcePath)

  try {
    $ratioX = $TargetMaxWidth / $srcImage.Width
    $ratioY = $TargetMaxHeight / $srcImage.Height
    $ratio = [Math]::Min($ratioX, $ratioY)

    if ($ratio -ge 1) {
      $newWidth = $srcImage.Width
      $newHeight = $srcImage.Height
    }
    else {
      $newWidth = [Math]::Max(1, [int]($srcImage.Width * $ratio))
      $newHeight = [Math]::Max(1, [int]($srcImage.Height * $ratio))
    }

    $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)

    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)
      }
      finally {
        $graphics.Dispose()
      }

      if ($ForceJpeg) {
        $destJpeg = [System.IO.Path]::ChangeExtension($DestinationPath, ".jpg")
        Save-Jpeg -Image $bitmap -Path $destJpeg -Quality $Quality
        return $destJpeg
      }

      $ext = [System.IO.Path]::GetExtension($DestinationPath).ToLowerInvariant()
      if ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
        Save-Jpeg -Image $bitmap -Path $DestinationPath -Quality $Quality
      }
      else {
        $bitmap.Save($DestinationPath)
      }

      return $DestinationPath
    }
    finally {
      $bitmap.Dispose()
    }
  }
  finally {
    $srcImage.Dispose()
  }
}

$images = Get-ChildItem -Path $sourceDir -Recurse -File |
  Where-Object { $_.Extension -match '^(?i)\.(jpg|jpeg|png)$' } |
  Sort-Object FullName

if ($images.Count -eq 0) {
  throw "Aucune image JPG/JPEG/PNG trouvee dans $SourceFolder"
}

$converted = 0
$totalBefore = 0L
$totalAfter = 0L

foreach ($img in $images) {
  $relative = [System.IO.Path]::GetRelativePath($sourceDir, $img.FullName)
  $destPath = Join-Path $outputDir $relative
  $destDir = Split-Path $destPath -Parent

  if (-not (Test-Path $destDir)) {
    New-Item -Path $destDir -ItemType Directory -Force | Out-Null
  }

  $totalBefore += $img.Length

  $forceJpeg = $ConvertPngToJpeg.IsPresent -and ($img.Extension -match '^(?i)\.png$')
  $savedPath = Resize-Image -SourcePath $img.FullName -DestinationPath $destPath -TargetMaxWidth $MaxWidth -TargetMaxHeight $MaxHeight -Quality $JpegQuality -ForceJpeg:$forceJpeg

  $savedInfo = Get-Item -Path $savedPath
  $totalAfter += $savedInfo.Length
  $converted += 1
}

$beforeMb = [Math]::Round($totalBefore / 1MB, 2)
$afterMb = [Math]::Round($totalAfter / 1MB, 2)
$saving = if ($totalBefore -gt 0) { [Math]::Round((1 - ($totalAfter / [double]$totalBefore)) * 100, 1) } else { 0 }

Write-Host "Optimisation terminee."
Write-Host ("Images traitees: {0}" -f $converted)
Write-Host ("Taille avant : {0} MB" -f $beforeMb)
Write-Host ("Taille apres : {0} MB" -f $afterMb)
Write-Host ("Gain estime  : {0}%" -f $saving)
Write-Host "Dossier de sortie: $OutputFolder"
Write-Host ""
Write-Host "Etape suivante:"
Write-Host (".\scripts\update-gallery-images.ps1 -ProjectRoot `"{0}`" -PhotosFolder `"{1}`"" -f $ProjectRoot, $OutputFolder)
