<?php
$host = 'localhost'; // 或 'localhost'
$db_name = 'COMP3421_PJ'; // 你在 phpMyAdmin 建立的資料庫名稱
$username = 'root';
$password = ''; // XAMPP 預設密碼為空
$charset = 'utf8mb4';

// 設定 DSN (Data Source Name)
$dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";

// 設定 PDO 選項
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // 錯誤時拋出例外
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // 結果以關聯陣列形式回傳
    PDO::ATTR_EMULATE_PREPARES   => false,                  // 禁用模擬預備語句以策安全
];

try {
    // 建立 PDO 連線實體
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (\PDOException $e) {
    // 如果連線失敗，顯示錯誤訊息並中止程式
    // 在正式環境中，應記錄錯誤而非直接顯示
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}
?>
