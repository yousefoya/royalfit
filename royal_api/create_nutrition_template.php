<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once 'db.php';

/* ✅ اقرأ JSON صح */
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

/* 🔍 Debug مؤقت (مهم) */
// file_put_contents("debug.txt", $raw);

$name = $data['name'] ?? null;
$description = $data['description'] ?? null;
$goal = $data['goal'] ?? null;

/* Normalize */
$goal = $goal ? strtolower($goal) : null;

if (!$name || !$goal) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => 'Missing required fields',
    'received' => $data
  ]);
  exit;
}

try {
  $stmt = $pdo->prepare("
    INSERT INTO nutrition_templates (name, description, goal)
    VALUES (?, ?, ?)
  ");
  $stmt->execute([$name, $description, $goal]);

  echo json_encode([
    'success' => true,
    'id' => $pdo->lastInsertId()
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}
