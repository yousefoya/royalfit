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

$input = json_decode(file_get_contents("php://input"), true);

$senderId   = $input['senderId']   ?? null;
$receiverId = $input['receiverId'] ?? null;
$text       = $input['text']       ?? null;

if (!$senderId || !$receiverId || !$text) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_id, receiver_id, text)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$senderId, $receiverId, $text]);

    // 👇 نرجع id + timestamp من DB
    $row = $pdo->query("
        SELECT id, timestamp 
        FROM messages 
        ORDER BY timestamp DESC 
        LIMIT 1
    ")->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success'   => true,
        'id'        => $row['id'],
        'timestamp' => $row['timestamp']
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
    exit;
}
