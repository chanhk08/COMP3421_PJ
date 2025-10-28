<?php
// api/orders.php

require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 假設 user_id 會從一個安全的認證機制中獲取，例如 JWT token。為簡化示範，我們先從 GET 參數讀取。
$user_id = $_GET['user_id'] ?? null;

switch ($method) {
    case 'GET':
        handle_get_orders($pdo);
        break;
    case 'POST':
        handle_post_orders($pdo);
        break;
    case 'PUT':
        handle_put_orders($pdo);
        break;
    case 'DELETE':
        handle_delete_orders($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        break;
}

/**
 * 讀取訂單
 * - /api/orders.php?order_id=1 : 獲取單一訂單及其詳細項目
 * - /api/orders.php?user_id=1  : 獲取某位使用者的所有訂單
 */
function handle_get_orders($pdo) {
    try {
        if (isset($_GET['order_id'])) {
            // ★ 修改：獲取單一訂單及其所有商品項目
            $order_id = $_GET['order_id'];
            
            // 查詢訂單主體資訊
            $stmt = $pdo->prepare("SELECT order_id, user_id, total_amount, status, order_date FROM orders WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch();

            if ($order) {
                // 查詢該訂單的所有商品項目
                $stmt_items = $pdo->prepare(
                    "SELECT oi.item_id, oi.quantity, oi.price_per_item, i.name 
                     FROM order_items oi 
                     JOIN items i ON oi.item_id = i.item_id 
                     WHERE oi.order_id = ?"
                );
                $stmt_items->execute([$order_id]);
                $items = $stmt_items->fetchAll();
                
                // 將商品項目陣列加入到訂單物件中
                $order['items'] = $items;
                
                echo json_encode($order);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found.']);
            }

        } elseif (isset($_GET['user_id'])) {
            // 獲取某使用者的所有訂單列表
            $stmt = $pdo->prepare("SELECT order_id, order_date, total_amount, status FROM orders WHERE user_id = ? ORDER BY order_date DESC");
            $stmt->execute([$_GET['user_id']]);
            $orders = $stmt->fetchAll();
            echo json_encode($orders);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'user_id or order_id is required.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 建立新訂單 (最複雜的邏輯)
 */
function handle_post_orders($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['user_id']) || empty($data['items']) || empty($data['shipping_address'])) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, items, and shipping_address are required.']);
        return;
    }

    $user_id = $data['user_id'];
    $items = $data['items'];
    $shipping_address = $data['shipping_address'];
    $total_amount = 0;

    try {
        // 開始交易
        $pdo->beginTransaction();

        // 1. 驗證庫存並計算總價
        foreach ($items as $item) {
            $stmt = $pdo->prepare("SELECT price, stock_quantity FROM items WHERE item_id = ? FOR UPDATE");
            $stmt->execute([$item['item_id']]);
            $db_item = $stmt->fetch();

            if (!$db_item || $db_item['stock_quantity'] < $item['quantity']) {
                $pdo->rollBack();
                http_response_code(409); // Conflict
                echo json_encode(['error' => 'Insufficient stock for item_id: ' . $item['item_id']]);
                return;
            }
            $total_amount += $db_item['price'] * $item['quantity'];
        }

        // 2. 建立訂單主記錄
        $stmt_order = $pdo->prepare("INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)");
        $stmt_order->execute([$user_id, $total_amount, $shipping_address]);
        $order_id = $pdo->lastInsertId();

        // 3. 建立訂單項目並更新庫存
        $stmt_order_item = $pdo->prepare("INSERT INTO order_items (order_id, item_id, quantity, price_per_item) VALUES (?, ?, ?, ?)");
        $stmt_update_stock = $pdo->prepare("UPDATE items SET stock_quantity = stock_quantity - ? WHERE item_id = ?");

        foreach ($items as $item) {
            $stmt_price = $pdo->prepare("SELECT price FROM items WHERE item_id = ?");
            $stmt_price->execute([$item['item_id']]);
            $price_per_item = $stmt_price->fetchColumn();

            // 插入 order_items
            $stmt_order_item->execute([$order_id, $item['item_id'], $item['quantity'], $price_per_item]);
            // 更新庫存
            $stmt_update_stock->execute([$item['quantity'], $item['item_id']]);
        }

        // 提交交易
        $pdo->commit();

        http_response_code(201);
        echo json_encode(['message' => 'Order created successfully.', 'order_id' => $order_id]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
    }
}


/**
 * 更新訂單 (主要是更新狀態)
 * URL: /api/orders.php?order_id=1
 */
function handle_put_orders($pdo) {
    if (!isset($_GET['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id is required.']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'status is required for update.']);
        return;
    }
    
    // 應驗證 status 是否為合法的 ENUM 值
    
    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
        $stmt->execute([$data['status'], $_GET['order_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Order status updated.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Order not found or status unchanged.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


/**
 * 刪除訂單 (通常是軟刪除，例如改為 'cancelled' 狀態)
 */
function handle_delete_orders($pdo) {
    // 實務上很少直接從資料庫刪除訂單。
    // 這裡我們示範一個「取消訂單」的邏輯，即將狀態改為 'cancelled'
    if (!isset($_GET['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id is required to cancel.']);
        return;
    }
    
    // TODO: 還原庫存的邏輯
    
    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = 'cancelled' WHERE order_id = ? AND status = 'pending'");
        $stmt->execute([$_GET['order_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Order cancelled.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Order not found or cannot be cancelled (e.g., already shipped).']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
