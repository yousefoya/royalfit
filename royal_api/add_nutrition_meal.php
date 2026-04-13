<?php
// ===============================
// CORS HEADERS (IMPORTANT)
// ===============================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$adminId    = $data['adminId'] ?? null;
$templateId = $data['templateId'] ?? null;
$name       = $data['name'] ?? null;
$time       = $data['time'] ?? null;
$calories   = $data['calories'] ?? 0;
$protein    = $data['protein'] ?? 0;
$carbs      = $data['carbs'] ?? 0;
$fats       = $data['fats'] ?? 0;

if (!$adminId || !$templateId || !$name) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing data']);
  exit;
}

// 🔐 تحقق أدمن
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$adminId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'admin') {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Unauthorized']);
  exit;
}

// ➕ إضافة الوجبة
$insert = $pdo->prepare("
  INSERT INTO nutrition_meals
  (template_id, name, time, calories, protein, carbs, fats)
  VALUES (?, ?, ?, ?, ?, ?, ?)
");

$insert->execute([
  $templateId,
  $name,
  $time,
  $calories,
  $protein,
  $carbs,
  $fats
]);

echo json_encode([
  'success' => true,
  'mealId' => $pdo->lastInsertId()
]);
