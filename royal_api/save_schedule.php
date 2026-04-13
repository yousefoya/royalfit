<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$clientId     = $data['clientId'] ?? null;
$trainerId    = $data['trainerId'] ?? null;
$scheduleText = $data['scheduleText'] ?? null;

if (!$clientId || !$trainerId || !$scheduleText) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

try {
    // 🔥 INSERT أو UPDATE تلقائي
    $stmt = $pdo->prepare("
        INSERT INTO schedules (client_id, trainer_id, schedule_text)
        VALUES (:client_id, :trainer_id, :schedule_text)
        ON DUPLICATE KEY UPDATE
          trainer_id = VALUES(trainer_id),
          schedule_text = VALUES(schedule_text)
    ");

    $stmt->execute([
        ':client_id' => $clientId,
        ':trainer_id' => $trainerId,
        ':schedule_text' => $scheduleText
    ]);
    // 🔥 تحديث تاريخ آخر تعديل للجدول
    $updateUser = $pdo->prepare("
        UPDATE users
        SET schedule_last_updated = NOW()
        WHERE id = :client_id
    ");

    $updateUser->execute([
        ':client_id' => $clientId
    ]);
    echo json_encode([
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
