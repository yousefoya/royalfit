<?php
// ===================================
// GET MY NUTRITION PLAN
// ===================================

ini_set('display_errors', 0);
error_reporting(0);

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

require_once 'db.php';

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing user_id'
    ]);
    exit;
}

try {
    // 1️⃣ جلب القالب المعيّن للمستخدم
    $planStmt = $pdo->prepare("
        SELECT t.id, t.name, t.description, t.goal
        FROM user_nutrition_plans p
        JOIN nutrition_templates t ON p.template_id = t.id
        WHERE p.user_id = ?
        LIMIT 1
    ");
    $planStmt->execute([$userId]);
    $template = $planStmt->fetch(PDO::FETCH_ASSOC);

    if (!$template) {
        throw new Exception('No nutrition plan assigned');
    }

    // 2️⃣ جلب الوجبات
    $mealsStmt = $pdo->prepare("
        SELECT id, name, time, calories, protein, carbs, fats
        FROM nutrition_meals
        WHERE template_id = ?
        ORDER BY id ASC
    ");
    $mealsStmt->execute([$template['id']]);
    $meals = $mealsStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($meals as &$meal) {
        // 3️⃣ جلب المكونات
        $ingredientsStmt = $pdo->prepare("
            SELECT name, amount
            FROM nutrition_ingredients
            WHERE meal_id = ?
            ORDER BY id ASC
        ");
        $ingredientsStmt->execute([$meal['id']]);
        $meal['ingredients'] = $ingredientsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $template['meals'] = $meals;

    echo json_encode($template);

} catch (Exception $e) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
