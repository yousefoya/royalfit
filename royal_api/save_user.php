<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents("php://input"), true);

$required = ['name', 'phone', 'role', 'password'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "الحقل $field مطلوب"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$name  = trim($input['name']);
$phone = trim($input['phone']);
$role  = trim($input['role']);
$password = $input['password'];
$trainerId = $input['trainerId'] ?? null;
$subscriptionEndDate = $input['subscriptionEndDate'] ?? null;

if (!in_array($role, ['admin', 'trainer', 'member', 'reception'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'دور غير صالح'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($role === 'member' && !$trainerId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'يجب اختيار مدرب'], JSON_UNESCAPED_UNICODE);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$subEnd = null;
if ($subscriptionEndDate) {
    $dt = new DateTime($subscriptionEndDate);
    $subEnd = $dt->format('Y-m-d H:i:s');
}

$DEFAULT_AVATAR = 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg';
$scheduleStatus = ($role === 'member') ? 'pending' : null;

try {
    $stmt = $pdo->prepare("
        INSERT INTO users (
            name,
            phone,
            role,
            password_hash,
            trainer_id,
            subscription_end_date,
            schedule_status,
            schedule_last_updated,
            avatar
        ) VALUES (
            :name,
            :phone,
            :role,
            :password_hash,
            :trainer_id,
            :subscription_end_date,
            :schedule_status,
            NULL,
            :avatar
    )
");


    $stmt->execute([
        ':name' => $name,
        ':phone' => $phone,
        ':role' => $role,
        ':password_hash' => $passwordHash,
        ':trainer_id' => $trainerId,
        ':subscription_end_date' => $subEnd,
        ':schedule_status' => $scheduleStatus,
        ':avatar' => $DEFAULT_AVATAR
    ]);

    echo json_encode([
        'success' => true,
        'id' => (int)$pdo->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);
exit;

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'رقم الهاتف مستخدم مسبقاً'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage() // مهم للتصحيح
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}
