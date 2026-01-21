<?php
$path = $_GET['image'] ?? '';
$path = str_replace('\\', '/', $path);
$realPath = realpath($path);

if (!$realPath || !file_exists($realPath)) {
    die('File not found: ' . htmlspecialchars($path));
}

// Detect actual image type
$mime = mime_content_type($realPath);

switch ($mime) {
    case 'image/jpeg':
        $img = @imagecreatefromjpeg($realPath);
        break;
    case 'image/png':
        $img = @imagecreatefrompng($realPath);
        break;
    case 'image/gif':
        $img = @imagecreatefromgif($realPath);
        break;
    default:
        die('Unsupported image type: ' . $mime);
}

if (!$img) {
    die('Failed to load image: ' . htmlspecialchars($realPath));
}

// Rotate 90 degrees clockwise
$rotated = imagerotate($img, -90, 0);

// Save rotated image in the correct format
switch ($mime) {
    case 'image/jpeg':
        imagejpeg($rotated, $realPath, 100);
        break;
    case 'image/png':
        imagepng($rotated, $realPath);
        break;
    case 'image/gif':
        imagegif($rotated, $realPath);
        break;
}

imagedestroy($img);
imagedestroy($rotated);

echo "Image rotated successfully!";
