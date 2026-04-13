<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("
  INSERT IGNORE INTO challenge_participants (user_id, challenge_id)
  VALUES (?, ?)
");
$stmt->execute([$data['userId'], $data['challengeId']]);

echo json_encode(['success' => true]);
