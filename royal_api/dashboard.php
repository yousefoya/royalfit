<?php
require_once 'db.php';

header("Content-Type: application/json");

// ====== Gym Stats ======
function getGymStats($pdo) {

    $registered = $pdo->query("
        SELECT COUNT(*) FROM users
    ")->fetchColumn() ?: 0;

    $members = $pdo->query("
        SELECT COUNT(*) 
        FROM users 
        WHERE role = 'member'
    ")->fetchColumn() ?: 0;

    $active_now = $pdo->query("
        SELECT COUNT(*) 
        FROM users 
        WHERE role = 'member'
        AND subscription_end_date IS NOT NULL
        AND subscription_end_date >= NOW()
    ")->fetchColumn() ?: 0;


    return [
        'registeredUsers' => (int)$registered,
        'totalMembers' => (int)$members,
        'activeUsers' => (int)$active_now
    ];
}

// ====== Trainers ======
function getTrainersWithMembers($pdo) {

    $stmt = $pdo->query("
        SELECT id, name 
        FROM users 
        WHERE role = 'trainer'
    ");

    $trainers = $stmt->fetchAll();

    foreach ($trainers as &$trainer) {

        $stmtMembers = $pdo->prepare("
            SELECT id, name 
            FROM users 
            WHERE trainer_id = ?
            AND role = 'member'
        ");

        $stmtMembers->execute([$trainer['id']]);
        $members = $stmtMembers->fetchAll();

        $trainer['memberCount'] = count($members);
        $trainer['rating'] = 4.5;
        $trainer['status'] = 'نشط';

        $trainer['members'] = array_map(function($m) {
            return [
                'id' => $m['id'],
                'name' => $m['name'],
                'initial' => mb_substr($m['name'], 0, 1)
            ];
        }, $members);

    }

    return $trainers;
}

echo json_encode([
    'stats' => getGymStats($pdo),
    'trainers' => getTrainersWithMembers($pdo)
]);
