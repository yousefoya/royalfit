<?php
require 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;

if (!$id) {
    echo json_encode([
        "success" => false,
        "error" => "Missing ID"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM exercises_library WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        "success" => true
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
