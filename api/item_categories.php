<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$itemId = $_GET['item_id'] ?? null;
if (!$itemId) {
    http_response_code(400);
    echo json_encode(['error' => 'item_id is required']);
    exit;
}

switch ($method) {
    case 'GET':
        // 讀出商品所有分類id
        $stmt = $pdo->prepare("SELECT category_id FROM item_categories WHERE item_id = ?");
        $stmt->execute([$itemId]);
        $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($categories);
        break;

    case 'PUT':
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['category_ids']) || !is_array($data['category_ids'])) {
            http_response_code(400);
            echo json_encode(['error' => 'category_ids array is required']);
            exit;
        }
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("DELETE FROM item_categories WHERE item_id = ?");
            $stmt->execute([$itemId]);
            $stmtInsert = $pdo->prepare("INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)");
            foreach ($data['category_ids'] as $catId) {
                $stmtInsert->execute([$itemId, $catId]);
            }
            $pdo->commit();
            echo json_encode(['message' => 'Category associations updated']);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
