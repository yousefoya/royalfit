<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// 🔥 اقرأ JSON صح
$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

// fallback لو JSON فاضي
if (!$input) {
    $input = $_POST;
}

$adminId = trim($input['adminId'] ?? '');
$userId  = trim($input['userId'] ?? '');

// 🔍 Debug (مهم الآن)
if ($adminId === '' || $userId === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing adminId or userId',
        'received' => $input,
        'raw' => $raw
    ]);
    exit;
}

// 🔐 تحقق أن الأدمن فعلاً Admin
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$adminId]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin || strtolower($admin['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized'
    ]);
    exit;
}

// 🧨 منع حذف نفسك
if ($adminId === $userId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Cannot delete yourself'
    ]);
    exit;
}

// 🗑️ حذف المستخدم
$stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
$stmt->execute([$userId]);

echo json_encode(['success' => true]);
