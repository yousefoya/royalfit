<?php
header("Content-Type: application/json");
require_once 'db.php';

$userId = $_GET['userId'] ?? null;
$challengeId = $_GET['challengeId'] ?? null;

if (!$userId || !$challengeId) {
  echo json_encode(['error' => 'missing_params']);
  exit;
}

/* =====================
   submissions per day
===================== */
$stmt = $pdo->prepare("
  SELECT day, status, submitted_at
  FROM challenge_submissions
  WHERE user_id = ? AND challenge_id = ?
");
$stmt->execute([$userId, $challengeId]);
$submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* =====================
   total approved points
===================== */
$pointsStmt = $pdo->prepare("
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN s.status = 'APPROVED'
        THEN (c.total_points / c.duration_days)
        ELSE 0
      END
    ), 0) AS points
  FROM challenge_submissions s
  JOIN challenges c ON c.id = s.challenge_id
  WHERE s.user_id = ?
");
$pointsStmt->execute([$userId]);
$points = (int)$pointsStmt->fetchColumn();

/* =====================
   joined challenges count
===================== */
$countStmt = $pdo->prepare("
  SELECT COUNT(*) 
  FROM user_challenges
  WHERE user_id = ?
");
$countStmt->execute([$userId]);
$challengeCount = (int)$countStmt->fetchColumn();

echo json_encode([
  'submissions' => $submissions,
  'points' => $points,
  'challengeCount' => $challengeCount
]);
