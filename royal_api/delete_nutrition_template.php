<?php
// ===================================
// DELETE NUTRITION TEMPLATE (ADMIN)
// ===================================

ini_set('display_errors', 0);
error_reporting(0);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$adminId = $data['adminId'] ?? null;
$templateId = $data['templateId'] ?? null;

if (!$adminId || !$templateId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

try {
    // 1️⃣ تحقق أدمن
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $adminStmt->execute([$adminId]);
    $admin = $adminStmt->fetch();

    if (!$admin || $admin['role'] !== 'admin') {
        throw new Exception('Unauthorized');
    }

    // 2️⃣ حذف القالب
    $delStmt = $pdo->prepare("
        DELETE FROM nutrition_templates WHERE id = ?
    ");
    $delStmt->execute([$templateId]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
