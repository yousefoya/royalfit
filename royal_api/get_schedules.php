<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->prepare("
        SELECT client_id, schedule_text, updated_at
        FROM schedules
    ");
    $stmt->execute();

    $result = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[(string)$row['client_id']] = [
            'text' => $row['schedule_text'],
            'updatedAt' => $row['updated_at']
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}