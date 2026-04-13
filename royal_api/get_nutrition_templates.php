<?php
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

try {
  // Templates
  $templates = $pdo->query("
    SELECT id, name, description, goal
    FROM nutrition_templates
    ORDER BY id DESC
  ")->fetchAll(PDO::FETCH_ASSOC);

  // Meals
  $meals = $pdo->query("
    SELECT *
    FROM nutrition_meals
    ORDER BY id ASC
  ")->fetchAll(PDO::FETCH_ASSOC);

  // Ingredients
  $ingredients = $pdo->query("
    SELECT *
    FROM nutrition_ingredients
    ORDER BY id ASC
  ")->fetchAll(PDO::FETCH_ASSOC);

  // Index meals by template
  $mealsByTemplate = [];
  foreach ($meals as $meal) {
    $meal['ingredients'] = [];
    $mealsByTemplate[$meal['template_id']][] = $meal;
  }

  // Index ingredients by meal
  foreach ($ingredients as $ing) {
    foreach ($mealsByTemplate as &$templateMeals) {
      foreach ($templateMeals as &$meal) {
        if ($meal['id'] === $ing['meal_id']) {
          $meal['ingredients'][] = [
            'name' => $ing['name'],
            'amount' => $ing['amount']
          ];
        }
      }
    }
  }

  // Attach meals to templates
  foreach ($templates as &$t) {
    $t['meals'] = $mealsByTemplate[$t['id']] ?? [];
  }

  echo json_encode([
    'success' => true,
    'templates' => $templates
  ]);

} catch (Throwable $e) {
  http_response_code(500);
  error_log($e->getMessage());
  echo json_encode([
    'success' => false,
    'error' => 'Failed to load nutrition templates'
  ]);
}
