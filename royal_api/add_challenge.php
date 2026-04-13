<?php
header("Content-Type: application/json");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
  empty($data['title']) ||
  empty($data['type']) ||
  empty($data['durationDays']) ||
  empty($data['totalPoints'])
) {
  echo json_encode([
    'success' => false,
    'error' => 'Missing data'
  ]);
  exit;
}

$stmt = $pdo->prepare("
  INSERT INTO challenges
    (title, description, type, duration_days, total_points, start_date, status)
  VALUES
    (?, ?, ?, ?, ?, ?, 'ACTIVE')
");

$stmt->execute([
  $data['title'],
  $data['description'] ?? '',
  $data['type'],                 // VIDEO | IMAGE | TEXT
  (int)$data['durationDays'],
  (int)$data['totalPoints'],
  $data['startDate'] ?: null     // تاريخ البداية
]);

echo json_encode([
  'success' => true,
  'id' => $pdo->lastInsertId()
]);
    