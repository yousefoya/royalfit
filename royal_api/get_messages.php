<?php
require_once 'db.php';

$userId = $_GET['user_id'] ?? '';
$otherId = $_GET['other_id'] ?? '';

if (!$userId || !$otherId) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
");
$stmt->execute([$userId, $otherId, $otherId, $userId]);
$messages = $stmt->fetchAll();

echo json_encode($messages);