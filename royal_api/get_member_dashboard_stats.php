<?php
header("Content-Type: application/json");
require_once 'db.php';

$userId = $_GET['userId'] ?? null;
if (!$userId) {
  echo json_encode([
    'active' => 0,
    'completed' => 0,
    'challenges' => 0,
    'points' => 0
  ]);
  exit;
}

/* ===== التحديات النشطة ===== */
/* أي تحدي له مشاركة (حتى لو Pending أو Rejected) */
$activeStmt = $pdo->prepare("
  SELECT COUNT(DISTINCT challenge_id)
  FROM challenge_submissions
  WHERE user_id = ?
");
$activeStmt->execute([$userId]);
$active = (int)$activeStmt->fetchColumn();

/* ===== التحديات المكتملة ===== */
/* التحدي مكتمل إذا عدد الأيام المقبولة = مدة التحدي */
$completedStmt = $pdo->prepare("
  SELECT COUNT(*) FROM (
    SELECT s.challenge_id
    FROM challenge_submissions s
    JOIN challenges c ON c.id = s.challenge_id
    WHERE s.user_id = ?
    GROUP BY s.challenge_id, c.duration_days
    HAVING SUM(s.status = 'APPROVED') = c.duration_days
  ) x
");
$completedStmt->execute([$userId]);
$completed = (int)$completedStmt->fetchColumn();

/* ===== عدد التحديات الكلي ===== */
$challengesStmt = $pdo->query("
  SELECT COUNT(*) FROM challenges WHERE status = 'ACTIVE'
");
$challenges = (int)$challengesStmt->fetchColumn();

/* ===== النقاط اليومية ===== */
/* كل يوم Approved = (total_points / duration_days) */
$pointsStmt = $pdo->prepare("
  SELECT IFNULL(SUM(
    c.total_points / c.duration_days
  ), 0)
  FROM challenge_submissions s
  JOIN challenges c ON c.id = s.challenge_id
  WHERE s.user_id = ? AND s.status = 'APPROVED'
");
$pointsStmt->execute([$userId]);
$points = (int)$pointsStmt->fetchColumn();

echo json_encode([
  'active' => $active,
  'completed' => $completed,
  'challenges' => $challenges,
  'points' => $points
]);
