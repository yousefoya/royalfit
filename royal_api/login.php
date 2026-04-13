<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);

$phone = trim($data['phone'] ?? '');
$password = trim($data['password'] ?? '');

if (!$phone || !$password) {
    echo json_encode([
        'success' => false,
        'error' => 'الرجاء إدخال رقم الهاتف وكلمة المرور'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'بيانات الدخول غير صحيحة']);
        exit;
    }

    // 🔐 تحقق كلمة المرور
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'error' => 'بيانات الدخول غير صحيحة']);
        exit;
    }

    // ⛔ فقط للمشتركين: تحقق من الاشتراك
    if ($user['role'] === 'member' && $user['subscription_end_date']) {
        $expiry = new DateTime($user['subscription_end_date']);
        $now = new DateTime();
        $now->setTime(0, 0, 0);
        $expiry->setTime(0, 0, 0);

        if ($now > $expiry) {
            echo json_encode([
                'success' => false,
                'error' => 'عذراً، انتهت صلاحية اشتراكك.'
            ]);
            exit;
        }
    }

    // 🚫 لا نرجع كلمة المرور
    unset($user['password_hash']);

    echo json_encode([
        'success' => true,
        'user' => $user
    ]);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'خطأ في الخادم'
    ]);
}
