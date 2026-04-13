<?php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {

    $stmt = $pdo->query("
        SELECT id, name, muscle_group AS muscle
        FROM exercises_library
        ORDER BY created_at DESC
    ");

    $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"   => true,
        "exercises" => $exercises
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage()
    ]);
}
