<?php
// ===================================
// ASSIGN NUTRITION PLAN TO USER
// ===================================

ini_set('display_errors', 0);
error_reporting(0);

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// DB
require_once 'db.php';

$input = json_decode(file_get_contents("php://input"), true);

$trainerId  = $input['trainerId']  ?? null;
$userId     = $input['userId']     ?? null;
$templateId = $input['templateId'] ?? null;

if (!$trainerId || !$userId || !$templateId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

try {
    // 1️⃣ تحقق أن المستخدم مشترك
    $userStmt = $pdo->prepare("
        SELECT id, role, trainer_id
        FROM users
        WHERE id = ?
    ");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['role'] !== 'member') {
        throw new Exception('Target user is not a member');
    }

    // 2️⃣ تحقق أن المدرب هو المدرب المعيّن لهذا المشترك
    if ((string)$user['trainer_id'] !== (string)$trainerId) {
        throw new Exception('Unauthorized trainer');
    }

    // 3️⃣ تحقق أن القالب موجود
    $templateStmt = $pdo->prepare("
        SELECT id
        FROM nutrition_templates
        WHERE id = ?
    ");
    $templateStmt->execute([$templateId]);

    if (!$templateStmt->fetch()) {
        throw new Exception('Nutrition template not found');
    }

    // 4️⃣ Insert أو Update (Upsert)
    $assignStmt = $pdo->prepare("
        INSERT INTO user_nutrition_plans (user_id, template_id, assigned_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          template_id = VALUES(template_id),
          assigned_by = VALUES(assigned_by),
          assigned_at = CURRENT_TIMESTAMP
    ");
    $assignStmt->execute([
        $userId,
        $templateId,
        $trainerId
    ]);

    echo json_encode([
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
