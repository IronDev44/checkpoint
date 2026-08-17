Add-Type -AssemblyName System.Drawing

function New-RoundedPath {
  param([System.Drawing.RectangleF] $Rect, [single] $Radius)

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $Radius * 2
  $path.AddArc($Rect.X, $Rect.Y, $d, $d, 180, 90)
  $path.AddArc(($Rect.Right - $d), $Rect.Y, $d, $d, 270, 90)
  $path.AddArc(($Rect.Right - $d), ($Rect.Bottom - $d), $d, $d, 0, 90)
  $path.AddArc($Rect.X, ($Rect.Bottom - $d), $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Stroke-RoundedRectangle {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Pen] $Pen,
    [System.Drawing.RectangleF] $Rect,
    [single] $Radius
  )

  $path = New-RoundedPath -Rect $Rect -Radius $Radius
  $Graphics.DrawPath($Pen, $path)
  $path.Dispose()
}

function Add-CpMonogramPath {
  param([System.Drawing.Drawing2D.GraphicsPath] $Path, [single] $Scale)

  $Path.StartFigure()
  $Path.AddLines([System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF (560 * $Scale), (326 * $Scale)),
    (New-Object System.Drawing.PointF (338 * $Scale), (326 * $Scale)),
    (New-Object System.Drawing.PointF (244 * $Scale), (420 * $Scale)),
    (New-Object System.Drawing.PointF (244 * $Scale), (590 * $Scale)),
    (New-Object System.Drawing.PointF (338 * $Scale), (684 * $Scale)),
    (New-Object System.Drawing.PointF (560 * $Scale), (684 * $Scale)),
    (New-Object System.Drawing.PointF (560 * $Scale), (585 * $Scale)),
    (New-Object System.Drawing.PointF (384 * $Scale), (585 * $Scale)),
    (New-Object System.Drawing.PointF (344 * $Scale), (545 * $Scale)),
    (New-Object System.Drawing.PointF (344 * $Scale), (465 * $Scale)),
    (New-Object System.Drawing.PointF (384 * $Scale), (425 * $Scale)),
    (New-Object System.Drawing.PointF (560 * $Scale), (425 * $Scale))
  ))
  $Path.CloseFigure()

  $Path.StartFigure()
  $Path.AddLines([System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF (540 * $Scale), (326 * $Scale)),
    (New-Object System.Drawing.PointF (727 * $Scale), (326 * $Scale)),
    (New-Object System.Drawing.PointF (818 * $Scale), (417 * $Scale)),
    (New-Object System.Drawing.PointF (818 * $Scale), (499 * $Scale)),
    (New-Object System.Drawing.PointF (727 * $Scale), (590 * $Scale)),
    (New-Object System.Drawing.PointF (626 * $Scale), (590 * $Scale)),
    (New-Object System.Drawing.PointF (626 * $Scale), (748 * $Scale)),
    (New-Object System.Drawing.PointF (540 * $Scale), (672 * $Scale))
  ))
  $Path.CloseFigure()

  $Path.StartFigure()
  $Path.AddLines([System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF (626 * $Scale), (425 * $Scale)),
    (New-Object System.Drawing.PointF (700 * $Scale), (425 * $Scale)),
    (New-Object System.Drawing.PointF (727 * $Scale), (452 * $Scale)),
    (New-Object System.Drawing.PointF (727 * $Scale), (465 * $Scale)),
    (New-Object System.Drawing.PointF (700 * $Scale), (492 * $Scale)),
    (New-Object System.Drawing.PointF (626 * $Scale), (492 * $Scale))
  ))
  $Path.CloseFigure()
}

function New-CheckpointIcon {
  param(
    [int] $Size,
    [string] $Path,
    [bool] $Transparent = $false,
    [bool] $ForegroundOnly = $false,
    [bool] $Monochrome = $false
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $scale = $Size / 1024
  $teal = if ($Monochrome) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::FromArgb(255, 44, 244, 232) }
  $blue = if ($Monochrome) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::FromArgb(255, 24, 120, 255) }

  if (-not $Transparent -and -not $ForegroundOnly) {
    $bgRect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, ([System.Drawing.Color]::FromArgb(255, 2, 7, 14)), ([System.Drawing.Color]::FromArgb(255, 4, 18, 34)), 45
    $g.FillRectangle($bgBrush, $bgRect)
    $bgBrush.Dispose()

    $panelRect = New-Object System.Drawing.RectangleF (72 * $scale), (72 * $scale), (880 * $scale), (880 * $scale)
    $panelPath = New-RoundedPath -Rect $panelRect -Radius (180 * $scale)
    $panelBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $panelRect, ([System.Drawing.Color]::FromArgb(255, 8, 15, 27)), ([System.Drawing.Color]::FromArgb(255, 4, 10, 18)), 35
    $g.FillPath($panelBrush, $panelPath)
    $panelBrush.Dispose()

    $softEdge = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(105, $teal.R, $teal.G, $teal.B)), (20 * $scale)
    Stroke-RoundedRectangle -Graphics $g -Pen $softEdge -Rect $panelRect -Radius (180 * $scale)
    $softEdge.Dispose()

    $edgeGlow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, $blue.R, $blue.G, $blue.B)), (7 * $scale)
    Stroke-RoundedRectangle -Graphics $g -Pen $edgeGlow -Rect $panelRect -Radius (180 * $scale)
    $edgeGlow.Dispose()

    $haloPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $haloPath.AddEllipse((610 * $scale), (88 * $scale), (330 * $scale), (330 * $scale))
    $haloBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush $haloPath
    $haloBrush.CenterColor = [System.Drawing.Color]::FromArgb(135, 30, 130, 255)
    $haloBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 30, 130, 255))
    $g.FillPath($haloBrush, $haloPath)
    $haloBrush.Dispose()
    $haloPath.Dispose()
    $panelPath.Dispose()
  }

  $logoPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $logoPath.FillMode = [System.Drawing.Drawing2D.FillMode]::Alternate
  Add-CpMonogramPath -Path $logoPath -Scale $scale

  $logoBounds = New-Object System.Drawing.RectangleF (210 * $scale), (290 * $scale), (640 * $scale), (480 * $scale)
  $logoGlow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(75, $teal.R, $teal.G, $teal.B)), (34 * $scale)
  $g.DrawPath($logoGlow, $logoPath)
  $logoGlow.Dispose()

  $logoBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $logoBounds, $teal, $blue, 90
  $g.FillPath($logoBrush, $logoPath)
  $logoBrush.Dispose()
  $logoPath.Dispose()

  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $pixels = @(
    @(330, 368, 24), @(294, 379, 18), @(257, 390, 16), @(217, 404, 14), @(183, 420, 11),
    @(330, 412, 18), @(293, 419, 24), @(252, 430, 18), @(209, 444, 15), @(169, 458, 11),
    @(313, 456, 16), @(279, 466, 20), @(238, 478, 22), @(199, 494, 16), @(156, 514, 12),
    @(311, 504, 20), @(268, 514, 18), @(229, 529, 22), @(190, 548, 17), @(147, 572, 13),
    @(326, 552, 16), @(288, 561, 20), @(248, 577, 18), @(207, 595, 14), @(164, 623, 10),
    @(348, 601, 20), @(307, 611, 16), @(262, 627, 15), @(220, 651, 11)
  )

  foreach ($p in $pixels) {
    $mix = [Math]::Min(1, [Math]::Max(0, ($p[1] - 360) / 300))
    $r = [int]($teal.R * (1 - $mix) + $blue.R * $mix)
    $gr = [int]($teal.G * (1 - $mix) + $blue.G * $mix)
    $b = [int]($teal.B * (1 - $mix) + $blue.B * $mix)
    $alpha = if ($p[0] -lt 190) { 135 } elseif ($p[0] -lt 240) { 175 } else { 225 }
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $r, $gr, $b))
    $rect = New-Object System.Drawing.RectangleF (($p[0] - $p[2] / 2) * $scale), (($p[1] - $p[2] / 2) * $scale), ($p[2] * $scale), ($p[2] * $scale)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()
  }
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $g.Dispose()

  $dir = Split-Path $Path
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$assets = @(
  @{ Size = 512; Path = "public/logo512.png"; Transparent = $false; ForegroundOnly = $false; Monochrome = $false },
  @{ Size = 192; Path = "public/logo192.png"; Transparent = $false; ForegroundOnly = $false; Monochrome = $false },
  @{ Size = 1024; Path = "public/logo-cp-transparent.png"; Transparent = $true; ForegroundOnly = $true; Monochrome = $false },
  @{ Size = 1024; Path = "checkpoint-mobile/assets/icon.png"; Transparent = $false; ForegroundOnly = $false; Monochrome = $false },
  @{ Size = 1024; Path = "checkpoint-mobile/assets/splash-icon.png"; Transparent = $true; ForegroundOnly = $true; Monochrome = $false },
  @{ Size = 1024; Path = "checkpoint-mobile/assets/android-icon-foreground.png"; Transparent = $true; ForegroundOnly = $true; Monochrome = $false },
  @{ Size = 1024; Path = "checkpoint-mobile/assets/android-icon-monochrome.png"; Transparent = $true; ForegroundOnly = $true; Monochrome = $true },
  @{ Size = 64; Path = "public/favicon.png"; Transparent = $false; ForegroundOnly = $false; Monochrome = $false },
  @{ Size = 64; Path = "checkpoint-mobile/assets/favicon.png"; Transparent = $false; ForegroundOnly = $false; Monochrome = $false }
)

foreach ($asset in $assets) {
  New-CheckpointIcon @asset
}

$bg = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bg)
$rect = New-Object System.Drawing.RectangleF 0, 0, 1024, 1024
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255, 5, 9, 16)), ([System.Drawing.Color]::FromArgb(255, 4, 24, 36)), 45
$g.FillRectangle($brush, $rect)
$brush.Dispose()
$g.Dispose()
$bg.Save("checkpoint-mobile/assets/android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bg.Dispose()
