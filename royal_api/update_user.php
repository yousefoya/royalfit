<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

/* 🔥 IMPORTANT: db.php creates $pdo, NOT $conn */
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$name = $data['name'] ?? null;
$phone = $data['phone'] ?? null;
$role = $data['role'] ?? null;
$trainerId = $data['trainerId'] ?? null;
$subscriptionEndDate = $data['subscriptionEndDate'] ?? null;

if (!$id || !$name || !$phone || !$role) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE users SET
        name = :name,
        phone = :phone,
        role = :role,
        trainer_id = :trainer_id,
        subscription_end_date = :subscription_end_date
    WHERE id = :id
");

$stmt->execute([
    ':name' => $name,
    ':phone' => $phone,
    ':role' => $role,
    ':trainer_id' => $trainerId,
    ':subscription_end_date' => $subscriptionEndDate,
    ':id' => $id
]);

echo json_encode(['success' => true]);
