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

    // 如果是 OPTIONS 請求 (CORS 預檢請求)，直接回傳成功
    if ($method == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // 根據不同的請求方法，執行不同的操作
    switch ($method) {
        case 'GET':
            handle_get($pdo);
            break;
        case 'POST':
            handle_post($pdo);
            break;
        case 'PUT':
            handle_put($pdo);
            break;
        default:
            // 如果是不支援的方法
            http_response_code(405); // Method Not Allowed
            echo json_encode(['error' => 'Method not allowed.']);
            break;
    }

    /**
     * 處理 GET 請求 (查看使用者資料)
     * URL 範例: /api/users.php?user_id=1
     */
    function handle_get($pdo) {
        // 檢查 URL 是否有提供 user_id
        if (!isset($_GET['user_id'])) {
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'user_id is required.']);
            return;
        }

        $userId = $_GET['user_id'];

        try {
            $stmt = $pdo->prepare("SELECT user_id, username, email, full_name, address, phone_number, role, created_at FROM users WHERE user_id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'User not found.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * 處理 POST 請求 (註冊新使用者)
     */
    function handle_post($pdo) {
        // 從請求主體 (request body) 獲取 JSON 資料
        $data = json_decode(file_get_contents('php://input'), true);

        // 簡單的資料驗證
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username, email, and password are required.']);
            return;
        }

        // ★★★ 安全性：對密碼進行雜湊處理 ★★★
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

        try {
            $sql = "INSERT INTO users (username, email, password_hash, full_name, address, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['username'],
                $data['email'],
                $password_hash,
                $data['full_name'] ?? null, // 使用 ?? 運算子提供預設值
                $data['address'] ?? null,
                $data['phone_number'] ?? null
            ]);

            $userId = $pdo->lastInsertId();
            http_response_code(201); // Created
            echo json_encode(['message' => 'User created successfully.', 'user_id' => $userId]);

        } catch (PDOException $e) {
            http_response_code(500);
            // 檢查是否為重複鍵值的錯誤 (例如 username 或 email 重複)
            if ($e->getCode() == 23000) {
                http_response_code(409); // Conflict
                echo json_encode(['error' => 'Username or email already exists.']);
            } else {
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        }
    }

    /**
     * 處理 PUT 請求 (修改使用者資料)
     * URL 範例: /api/users.php?user_id=1
     */
    function handle_put($pdo) {
        if (!isset($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id is required for updating.']);
            return;
        }
    
        $userId = $_GET['user_id'];
        $data = json_decode(file_get_contents('php://input'), true);
    
        if (empty($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided for update.']);
            return;
        }
    
        try {
            $updateFields = [];
            $params = [];
        
            // 允許更新的欄位，照前端欄位調整
            $allowedFields = ['full_name', 'address', 'phone_number', 'email', 'password_hash'];
        
            // 密碼欄位特別處理，更新前先雜湊
            if (isset($data['password'])) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
                unset($data['password']);
            }
        
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
        
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE user_id = ?";
            $params[] = $userId;
        
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'User updated successfully.']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'User not found or no changes made.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    ?>
