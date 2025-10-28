<?php
// api/login.php

require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT user_id, username, password_hash, role FROM users WHERE username = ?");
    $stmt->execute([$data['username']]);
    $user = $stmt->fetch();

    // 驗證使用者是否存在，以及密碼是否正確
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        // 登入成功
        // 不回傳密碼雜湊
        unset($user['password_hash']);
        
        // 在真實應用中，這裡應該生成並回傳一個 JWT (JSON Web Token)
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Login successful.',
            'user' => $user
        ]);
        
    } else {
        // 登入失敗
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid username or password.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
