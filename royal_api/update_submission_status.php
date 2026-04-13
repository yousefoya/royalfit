<?php
header("Content-Type: application/json");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$id || !$status) {
  echo json_encode(['success' => false]);
  exit;
}

$stmt = $pdo->prepare("
  UPDATE challenge_submissions
  SET status = ?
  WHERE id = ?
");

$stmt->execute([$status, $id]);

echo json_encode(['success' => true]);
