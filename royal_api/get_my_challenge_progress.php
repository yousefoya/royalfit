<?php
header("Content-Type: application/json");
require_once 'db.php';

$userId = $_GET['userId'] ?? null;
$challengeId = $_GET['challengeId'] ?? null;

$stmt = $pdo->prepare("
  SELECT day, status, submitted_at
  FROM challenge_submissions
  WHERE user_id=? AND challenge_id=?
");
$stmt->execute([$userId, $challengeId]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
