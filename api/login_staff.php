<?php
// api/staff_login.php

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

    if ($user && password_verify($data['password'], $user['password_hash'])) {
        if ($user['role'] === 'staff' || $user['role'] === 'admin') {
            unset($user['password_hash']);
            http_response_code(200);
            echo json_encode([
                'message' => 'Staff login successful.',
                'user' => $user
            ]);
        } else {
            http_response_code(403); // Forbidden
            echo json_encode(['error' => 'Access denied: not staff.']);
        }
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid username or password.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
