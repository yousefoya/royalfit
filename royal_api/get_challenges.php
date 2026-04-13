<?php
header("Content-Type: application/json");
require_once 'db.php';

$stmt = $pdo->query("
  SELECT
    id,
    title,
    description,
    type,
    duration_days,
    total_points,
    status,
    created_at
  FROM challenges
  ORDER BY created_at DESC
");

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
    'startDate' => $row['created_at'],
    'status' => $row['status'],
    'participantsCount' => 0
  ];
}

echo json_encode($challenges);
