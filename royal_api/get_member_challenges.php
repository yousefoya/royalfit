<?php
require_once 'db.php';

$userId = $_GET['userId'];

$stmt = $pdo->prepare("
  SELECT c.*
  FROM challenges c
  JOIN challenge_participants p ON p.challenge_id = c.id
  WHERE p.user_id = ?
");
$stmt->execute([$userId]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

/*
  نجيب فقط التحديات
  اللي المستخدم مشترك فيها
*/
$stmt = $pdo->prepare("
  SELECT
    c.id,
    c.title,
    c.description,
    c.type,
    c.duration_days,
    c.total_points,
    c.status
  FROM challenges c
  JOIN user_challenges uc
    ON uc.challenge_id = c.id
  WHERE uc.user_id = ?
  ORDER BY c.created_at DESC
");

$stmt->execute([$userId]);

$challenges = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
  $challenges[] = [
    'id' => (string)$row['id'],
    'title' => $row['title'],
    'description' => $row['description'],
    'type' => $row['type'],
    'durationDays' => (int)$row['duration_days'],
    'totalPoints' => (int)$row['total_points'],
    'pointsPerDay' => $row['duration_days'] > 0
      ? floor($row['total_points'] / $row['duration_days'])
      : 0,
    'status' => $row['status'],
    'participantsCount' => 0
  ];
}

echo json_encode($challenges);
