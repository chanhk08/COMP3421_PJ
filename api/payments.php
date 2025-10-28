<?php
// api/payments.php

require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        handle_get_payments($pdo);
        break;
    case 'POST':
        handle_post_payments($pdo);
        break;
    case 'PUT':
        handle_put_payments($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        break;
}

/**
 * 讀取付款紀錄
 * URL: /api/payments.php?order_id=1
 */
function handle_get_payments($pdo) {
    if (!isset($_GET['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id is required.']);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE order_id = ?");
        $stmt->execute([$_GET['order_id']]);
        $payments = $stmt->fetchAll();

        echo json_encode($payments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 新增付款紀錄
 */
function handle_post_payments($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['order_id']) || empty($data['amount']) || empty($data['payment_method'])) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id, amount, and payment_method are required.']);
        return;
    }

    try {
        $sql = "INSERT INTO payments (order_id, payment_method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['order_id'],
            $data['payment_method'],
            $data['transaction_id'] ?? null,
            $data['amount'],
            $data['status'] ?? 'completed'
        ]);

        // 同時更新訂單狀態為 'paid'
        $stmt_order = $pdo->prepare("UPDATE orders SET status = 'paid' WHERE order_id = ?");
        $stmt_order->execute([$data['order_id']]);

        http_response_code(201);
        echo json_encode(['message' => 'Payment recorded and order status updated.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * 更新付款狀態 (較少用，例如由 pending 改為 failed)
 */
function handle_put_payments($pdo) {
    if (!isset($_GET['payment_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'payment_id is required.']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'status is required.']);
        return;
    }

    try {
        $stmt = $pdo->prepare("UPDATE payments SET status = ? WHERE payment_id = ?");
        $stmt->execute([$data['status'], $_GET['payment_id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Payment status updated.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Payment record not found or status unchanged.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
