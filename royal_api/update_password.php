<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents("php://input"), true);

$userId = isset($input['userId']) ? (int)$input['userId'] : null;
$password = $input['password'] ?? null;

if (!$userId || !$password) {
  echo json_encode(['success' => false, 'error' => 'Missing fields']);
  exit;
}

try {
  $hashed = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $pdo->prepare(
    "UPDATE users SET password_hash = :password WHERE id = :id"
  );

  $stmt->execute([
    ':password' => $hashed,
    ':id' => $userId
  ]);

  echo json_encode(['success' => true]);
  exit;

} catch (Throwable $e) {
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
  exit;
}
