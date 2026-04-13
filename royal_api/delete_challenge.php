<?php
header("Content-Type: application/json");
require_once 'db.php';

$challengeId = $_GET['id'] ?? null;
$force = $_GET['force'] ?? '0';

if (!$challengeId) {
  echo json_encode([
    'success' => false,
    'error' => 'missing_challenge_id'
  ]);
  exit;
}

try {
  /* =======================
     Check submissions
  ======================= */
  $stmt = $pdo->prepare(
    "SELECT COUNT(*) FROM challenge_submissions WHERE challenge_id = ?"
  );
  $stmt->execute([$challengeId]);
  $count = (int)$stmt->fetchColumn();

  if ($count > 0 && $force !== '1') {
    echo json_encode([
      'success' => false,
      'error' => 'challenge_has_submissions',
      'count' => $count
    ]);
    exit;
  }

  /* =======================
     FORCE DELETE
  ======================= */
  $pdo->beginTransaction();

  // حذف كل المشاركات المرتبطة بالتحدي
  $pdo->prepare(
    "DELETE FROM challenge_submissions WHERE challenge_id = ?"
  )->execute([$challengeId]);

  // حذف التحدي نفسه
  $pdo->prepare(
    "DELETE FROM challenges WHERE id = ?"
  )->execute([$challengeId]);

  $pdo->commit();

  echo json_encode([
    'success' => true
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }

  echo json_encode([
    'success' => false,
    'error' => 'delete_failed',
    'details' => $e->getMessage() // للتجربة فقط
  ]);
}
