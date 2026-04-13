<?php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$name   = trim($data['name'] ?? '');
$muscle = trim($data['muscle'] ?? ''); // نستقبل muscle من React

if (empty($name) || empty($muscle)) {
    echo json_encode([
        "success" => false,
        "error"   => "Missing fields"
    ]);
    exit;
}

try {

    $stmt = $pdo->prepare(
        "INSERT INTO exercises_library (name, muscle_group)
         VALUES (:name, :muscle)"
    );

    $stmt->execute([
        ':name'   => $name,
        ':muscle' => $muscle
    ]);

    echo json_encode([
        "success" => true,
        "id"      => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage()
    ]);
}
