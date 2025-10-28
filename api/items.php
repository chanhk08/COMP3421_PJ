<?php
// 引入資料庫連接設定
require_once '../config/database.php';

// 設定通用標頭
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 允許所有來源的跨域請求 (開發用)
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 獲取當前的請求方法
$method = $_SERVER['REQUEST_METHOD'];

// 處理 CORS 預檢請求
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 根據不同的請求方法，執行不同的操作
switch ($method) {
    case 'GET':
        handle_get_items($pdo);
        break;
    case 'POST':
        handle_post_items($pdo);
        break;
    case 'PUT':
        handle_put_items($pdo);
        break;
    case 'DELETE':
        handle_delete_items($pdo);
        break;
    default:
        // 如果是不支援的方法
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed.']);
        break;
}

/**
 * 處理 GET 請求 (讀取/查看商品)
 * 支援:
 * 1. /api/items.php -> 獲取所有商品
 * 2. /api/items.php?item_id=2 -> 獲取單一商品
 * 3. /api/items.php?search=keyword -> 搜尋商品
 */
function handle_get_items($pdo) {
    try {
        if (isset($_GET['item_id'])) {
            // 獲取單一商品 (邏輯不變)
            $stmt = $pdo->prepare("SELECT * FROM items WHERE item_id = ?");
            $stmt->execute([$_GET['item_id']]);
            $item = $stmt->fetch();
            if ($item) {
                echo json_encode($item);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Item not found.']);
            }
        } elseif (isset($_GET['search'])) {
            // ★ 新增：處理搜尋請求
            $keyword = '%' . $_GET['search'] . '%'; // 使用 % 進行模糊匹配
            // 在 name 或 description 欄位中尋找關鍵字
            $stmt = $pdo->prepare("SELECT item_id, name, price, stock_quantity, image_url FROM items WHERE name LIKE ? OR description LIKE ? ORDER BY name ASC");
            $stmt->execute([$keyword, $keyword]);
            $items = $stmt->fetchAll();
            echo json_encode($items);
        } else {
            // 獲取所有商品列表 (邏輯不變)
            $stmt = $pdo->query("SELECT item_id, name, price, stock_quantity, image_url FROM items ORDER BY created_at DESC");
            $items = $stmt->fetchAll();
            echo json_encode($items);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 處理 POST 請求 (建立新商品)
 */
function handle_post_items($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    // 驗證必要欄位
    if (empty($data['name']) || !isset($data['price']) || !isset($data['stock_quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, price, and stock_quantity are required.']);
        return;
    }

    try {
        $sql = "INSERT INTO items (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            $data['price'],
            $data['stock_quantity'],
            $data['category_id'] ?? null,
            $data['image_url'] ?? null
        ]);

        $itemId = $pdo->lastInsertId();
        http_response_code(201); // Created
        echo json_encode(['message' => 'Item created successfully.', 'item_id' => $itemId]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 處理 PUT 請求 (修改商品)
 * URL: /api/items.php?item_id=2
 */
function handle_put_items($pdo) {
    if (!isset($_GET['item_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'item_id is required for updating.']);
        return;
    }

    $itemId = $_GET['item_id'];
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'No data provided for update.']);
        return;
    }
    
    // 在真實應用中，可能需要驗證管理員權限

    try {
        $updateFields = [];
        $params = [];
        $allowedFields = ['name', 'description', 'price', 'stock_quantity', 'category_id', 'image_url'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No updatable fields provided.']);
            return;
        }

        $sql = "UPDATE items SET " . implode(', ', $updateFields) . " WHERE item_id = ?";
        $params[] = $itemId;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Item updated successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Item not found or no changes made.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 處理 DELETE 請求 (刪除商品)
 * URL: /api/items.php?item_id=2
 */
function handle_delete_items($pdo) {
    if (!isset($_GET['item_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'item_id is required for deletion.']);
        return;
    }

    // 在真實應用中，可能需要驗證管理員權限

    try {
        $stmt = $pdo->prepare("DELETE FROM items WHERE item_id = ?");
        $stmt->execute([$_GET['item_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Item deleted successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        // 如果有外鍵約束，刪除會失敗
        if ($e->getCode() == 23000) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'Cannot delete item. It might be referenced in existing orders.']);
        } else {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
