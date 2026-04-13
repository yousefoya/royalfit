<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'db.php';

$challenge_id = $_GET['challenge_id'] ?? null;

if (!$challenge_id) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.name,

        COALESCE(SUM(
            CASE 
                WHEN cs.status = 'APPROVED' 
                THEN FLOOR(c.total_points / c.duration_days)
                ELSE 0 
            END
        ), 0) AS total_points,

        SUM(CASE WHEN cs.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_days,
        SUM(CASE WHEN cs.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_days

    FROM challenge_submissions cs
    JOIN users u ON u.id = cs.user_id
    JOIN challenges c ON c.id = cs.challenge_id

    WHERE cs.challenge_id = ?

    GROUP BY u.id, u.name
    ORDER BY total_points DESC
");

$stmt->execute([$challenge_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
