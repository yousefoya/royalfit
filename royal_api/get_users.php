<?php
require_once 'db.php';

$stmt = $pdo->query("
  SELECT
    id,
    name,
    phone,
    role,
    avatar,
    trainer_id AS trainerId,
    subscription_end_date AS subscriptionEndDate,
    schedule_status AS scheduleStatus,
    schedule_last_updated AS scheduleLastUpdated
  FROM users
");

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
