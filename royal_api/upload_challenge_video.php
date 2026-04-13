<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit;
}

require_once 'db.php';

/* =======================
   Validate Input
======================= */
if (
  empty($_FILES['video']) ||
  empty($_POST['userId']) ||
  empty($_POST['challengeId']) ||
  !isset($_POST['day'])
) {
  echo json_encode([
    'success' => false,
    'error' => 'Missing data'
  ]);
  exit;
}

$userId = $_POST['userId'];        // BIGINT
$challengeId = $_POST['challengeId'];
$day = (int) $_POST['day'];
$video = $_FILES['video'];

/* =======================
   Validate Upload Errors
======================= */
if ($video['error'] !== UPLOAD_ERR_OK) {
  echo json_encode([
    'success' => false,
    'error' => 'Upload error'
  ]);
  exit;
}

/* =======================
   Validate File Size (≈ 2 min)
======================= */
$MAX_SIZE = 25 * 1024 * 1024; // 25MB
if ($video['size'] > $MAX_SIZE) {
  echo json_encode([
    'success' => false,
    'error' => 'Video too large (max 2 minutes)'
  ]);
  exit;
}

/* =======================
   Validate MIME Type (secure)
======================= */
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $video['tmp_name']);
finfo_close($finfo);

$allowedTypes = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

if (!in_array($mimeType, $allowedTypes)) {
  echo json_encode([
    'success' => false,
    'error' => 'Invalid video type'
  ]);
  exit;
}

/* =======================
   Prepare Upload Directory
======================= */
$dir = __DIR__ . "/uploads/challenges/$challengeId/$userId/";
if (!is_dir($dir)) {
  mkdir($dir, 0755, true);
}

/* =======================
   Save File
======================= */
$ext = pathinfo($video['name'], PATHINFO_EXTENSION);
$filename = "day_{$day}_" . time() . "." . $ext;
$relativePath = "uploads/challenges/$challengeId/$userId/$filename";
$absolutePath = __DIR__ . "/" . $relativePath;

if (!move_uploaded_file($video['tmp_name'], $absolutePath)) {
  echo json_encode([
    'success' => false,
    'error' => 'Upload failed'
  ]);
  exit;
}

/* =======================
   Insert (Race-condition safe)
======================= */
$stmt = $pdo->prepare("
  INSERT IGNORE INTO challenge_submissions
  (user_id, challenge_id, day, video_url)
  VALUES (?, ?, ?, ?)
");

$stmt->execute([$userId, $challengeId, $day, $relativePath]);

if ($stmt->rowCount() === 0) {
  echo json_encode([
    'success' => false,
    'error' => 'already_submitted'
  ]);
  exit;
}

/* =======================
   Success Response
======================= */
echo json_encode([
  'success' => true,
  'day' => $day,
  'status' => 'PENDING',
  'submitted_at' => date('Y-m-d H:i:s'),
  'video_url' => $relativePath
]);
exit;
