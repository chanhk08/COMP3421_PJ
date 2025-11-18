<?php
// api/cart.php

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

$user_id = $_GET['user_id'] ?? null;

switch ($method) {
    case 'GET':
        handle_get_cart($pdo, $user_id);
        break;
    case 'POST':
        handle_post_cart($pdo);
        break;
    case 'PUT':
        handle_put_cart($pdo);
        break;
    case 'DELETE':
        handle_delete_cart($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        break;
}


/**
 * Get cart items
 * URL: /api/cart.php?user_id=1
 */
function handle_get_cart($pdo, $user_id) {
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id is required.']);
        return;
    }

    try {
        // 使用 JOIN 查詢，同時獲取商品詳細資訊
        $sql = "SELECT ci.item_id, i.name, i.price, i.image_url, ci.quantity
                FROM cart_items ci
                JOIN items i ON ci.item_id = i.item_id
                WHERE ci.user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $cart_items = $stmt->fetchAll();

        echo json_encode($cart_items);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


/**
 * add items
 */
function handle_post_cart($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['user_id']) || empty($data['item_id']) || empty($data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, item_id, and quantity are required.']);
        return;
    }
    
    $quantity = intval($data['quantity']);
    if ($quantity <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Quantity must be a positive integer.']);
        return;
    }

    try {
        // 使用 INSERT ... ON DUPLICATE KEY UPDATE 語法
        // 如果 user_id 和 item_id 的組合已存在，則更新 quantity，否則新增一筆記錄
        $sql = "INSERT INTO cart_items (user_id, item_id, quantity) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['user_id'], $data['item_id'], $quantity]);

        http_response_code(200);
        echo json_encode(['message' => 'Cart updated successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


/**
 * edit items
 */
function handle_put_cart($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['user_id']) || empty($data['item_id']) || !isset($data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, item_id, and new quantity are required.']);
        return;
    }
    
    $quantity = intval($data['quantity']);
    if ($quantity <= 0) {
        // 0 || 0< will be removed 
        return handle_delete_cart($pdo, $data); 
    }

    try {
        $sql = "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$quantity, $data['user_id'], $data['item_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Item quantity updated.']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found in cart.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


/**
 * remove items
 */
function handle_delete_cart($pdo, $request_data = null) {
    $data = $request_data ?? json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_GET['user_id'] ?? $data['user_id'] ?? null;
    $item_id = $data['item_id'] ?? null;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id is required.']);
        return;
    }
    
    try {
        if ($item_id) {
            // remove signle cart item
            $sql = "DELETE FROM cart_items WHERE user_id = ? AND item_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$user_id, $item_id]);
            $message = 'Item removed from cart.';
        } else {
            // remove whole cart items
            $sql = "DELETE FROM cart_items WHERE user_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$user_id]);
            $message = 'Cart cleared.';
        }

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => $message]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No items to remove.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
