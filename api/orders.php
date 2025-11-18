<?php
// orders.php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get_orders($pdo);
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($_GET['action']) && $_GET['action'] === 'cancel') {
            if (!isset($data['order_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'order_id missing in request body']);
                exit;
            }
            handle_cancel_order_with_restock($pdo, $data['order_id']);
        } else {
            handle_post_orders($pdo);
        }
        break;
    case 'PUT':
        handle_put_orders($pdo);
        break;
    case 'DELETE':
        handle_delete_orders($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}

function handle_get_orders($pdo) {
    try {
        if (isset($_GET['order_id'])) {
            $order_id = (int)$_GET['order_id'];
            $stmt = $pdo->prepare("SELECT 
                order_id, user_id, order_date, total_amount, status,
                recipient_name, recipient_phone, shipping_address, shipping_city, shipping_postal_code, remark
                FROM orders WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($order) {
                $stmt_items = $pdo->prepare(
                    "SELECT oi.item_id, oi.quantity, oi.price_per_item, i.name 
                     FROM order_items oi 
                     JOIN items i ON oi.item_id = i.item_id 
                     WHERE oi.order_id = ?");
                $stmt_items->execute([$order_id]);
                $order['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode($order);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found.']);
            }
        } elseif (isset($_GET['user_id'])) {
            $stmt = $pdo->prepare(
                "SELECT order_id, user_id, recipient_name, order_date, total_amount, status
                 FROM orders 
                 WHERE user_id = ? ORDER BY order_date DESC"
            );
            $stmt->execute([$_GET['user_id']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            // 無參數則回傳所有訂單
            $stmt = $pdo->prepare(
                "SELECT 
                order_id, user_id, recipient_name, total_amount, status, order_date AS created_at
                FROM orders
                ORDER BY order_date DESC"
            );
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
    }
}

function handle_post_orders($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['userId']) || !isset($data['items']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing data.']);
        return;
    }

    $pdo->beginTransaction();

    try {
        $totalAmount = 0;
        foreach ($data['items'] as $item) {
            $totalAmount += $item['pricePerItem'] * $item['quantity'];
        }

        // 庫存檢查
        foreach ($data['items'] as $item) {
            $stmtStock = $pdo->prepare("SELECT stock_quantity, name FROM items WHERE item_id = ?");
            $stmtStock->execute([$item['itemId']]);
            $product = $stmtStock->fetch();

            if (!$product) {
                throw new Exception("Item ID {$item['itemId']} not found.");
            }

            if ($product['stock_quantity'] < $item['quantity']) {
                throw new Exception("Insufficient stock for product '{$product['name']}'. Available: {$product['stock_quantity']}, requested: {$item['quantity']}");
            }
        }

        // 建立訂單
        $sql_order = "INSERT INTO orders (
            user_id, recipient_name, recipient_phone, shipping_address, shipping_city,
            shipping_postal_code, remark, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid')";

        $stmt_order = $pdo->prepare($sql_order);
        $stmt_order->execute([
            $data['userId'],
            $data['recipientName'],
            $data['recipientPhone'],
            $data['shippingAddress'],
            $data['shippingCity'],
            $data['shippingPostalCode'],
            $data['remark'] ?? null,
            $totalAmount
        ]);

        $orderId = $pdo->lastInsertId();

        $sql_order_item = "INSERT INTO order_items (order_id, item_id, quantity, price_per_item) VALUES (?, ?, ?, ?)";
        $stmt_order_item = $pdo->prepare($sql_order_item);

        foreach ($data['items'] as $item) {
            $stmt_order_item->execute([
                $orderId,
                $item['itemId'],
                $item['quantity'],
                $item['pricePerItem']
            ]);

            // 減少庫存
            $stmtUpdateStock = $pdo->prepare("UPDATE items SET stock_quantity = stock_quantity - ? WHERE item_id = ? AND stock_quantity >= ?");
            $stmtUpdateStock->execute([$item['quantity'], $item['itemId'], $item['quantity']]);

            if ($stmtUpdateStock->rowCount() == 0) {
                throw new Exception("Insufficient stock for product ID {$item['itemId']} when updating inventory.");
            }
        }

        // 新增付款紀錄
        $sql_payment = "INSERT INTO payments (order_id, payment_method, amount, status) VALUES (?, ?, ?, 'completed')";
        $stmt_payment = $pdo->prepare($sql_payment);
        $stmt_payment->execute([
            $orderId,
            $data['paymentMethod'],
            $totalAmount
        ]);

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            'message' => 'Order created successfully!',
            'orderId' => $orderId
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'error' => 'Order failed: ' . $e->getMessage()
        ]);
    }
}

function handle_put_orders($pdo) {
    if (!isset($_GET['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id is required.']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => '`status` field is required for update.']);
        return;
    }

    $allowed_statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($data['status'], $allowed_statuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status value.']);
        return;
    }

    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
        $stmt->execute([$data['status'], $_GET['order_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Order status updated successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Order not found or status was not changed.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
    }
}

function handle_delete_orders($pdo) {
    if (!isset($_GET['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id is required to cancel an order.']);
        return;
    }

    $orderId = $_GET['order_id'];

    try {
        // 查詢該訂單商品明細
        $stmtItems = $pdo->prepare("SELECT item_id, quantity FROM order_items WHERE order_id = ?");
        $stmtItems->execute([$orderId]);
        $orderItems = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        $pdo->beginTransaction();

        // 回補庫存
        $stmtRestock = $pdo->prepare("UPDATE items SET stock_quantity = stock_quantity + ? WHERE item_id = ?");
        foreach ($orderItems as $item) {
            $stmtRestock->execute([$item['quantity'], $item['item_id']]);
        }

        // 更新訂單狀態為 cancelled，限定 pending 或 paid 狀態可改
        $stmtCancel = $pdo->prepare("UPDATE orders SET status = 'cancelled' WHERE order_id = ? AND status IN ('pending', 'paid')");
        $stmtCancel->execute([$orderId]);

        if ($stmtCancel->rowCount() > 0) {
            $pdo->commit();
            echo json_encode(['message' => 'Order has been cancelled and stock released.']);
        } else {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['message' => 'Order not found or cannot be cancelled (e.g., shipped).']);
        }
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handle_cancel_order_with_restock($pdo, $orderId) {
    try {
        $pdo->beginTransaction();

        // 取得該訂單的商品清單
        $stmtItems = $pdo->prepare("SELECT item_id, quantity FROM order_items WHERE order_id = ?");
        $stmtItems->execute([$orderId]);
        $orderItems = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        // 回補庫存
        $stmtRestock = $pdo->prepare("UPDATE items SET stock_quantity = stock_quantity + ? WHERE item_id = ?");
        foreach ($orderItems as $item) {
            $stmtRestock->execute([$item['quantity'], $item['item_id']]);
        }

        // 更新訂單狀態為 cancelled，只允許取消 pending、paid
        $stmtCancel = $pdo->prepare("UPDATE orders SET status = 'cancelled' WHERE order_id = ? AND status IN ('pending', 'paid')");
        $stmtCancel->execute([$orderId]);

        if ($stmtCancel->rowCount() === 0) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or cannot be cancelled']);
            exit;
        }

        $pdo->commit();
        echo json_encode(['message' => 'Order cancelled and stock replenished successfully.']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

?>