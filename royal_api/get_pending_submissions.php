<?php
header("Content-Type: application/json");
require_once 'db.php';

$stmt = $pdo->prepare("
  SELECT
    s.id,
    s.user_id,
    u.name AS userName,
    s.challenge_id,
    c.title AS challengeTitle,
    c.type AS challengeType,
    s.day,
    s.video_url,
    s.status,
    s.submitted_at
  FROM challenge_submissions s
  JOIN users u ON u.id = s.user_id
  JOIN challenges c ON c.id = s.challenge_id
  WHERE s.status = 'PENDING'
  ORDER BY s.submitted_at DESC
");

$stmt->execute();
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
