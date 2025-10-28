/**
 * js/auth.js
 * 處理使用者註冊、登入、登出及個人資料管理
 */

/**
 * 註冊新使用者
 * @param {object} userData - 包含 username, email, password 等的物件
 * @returns {Promise<any>}
 */
async function registerUser(userData) {
    return await apiRequest('users.php', 'POST', userData);
}

/**
 * 使用者登入
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<any>}
 */
async function loginUser(username, password) {
    return await apiRequest('login.php', 'POST', { username, password });
}

/**
 * 獲取使用者個人資料
 * @param {number} userId 
 * @returns {Promise<any>}
 */
async function getUserProfile(userId) {
    return await apiRequest('users.php', 'GET', { user_id: userId });
}

/**
 * 更新使用者個人資料
 * @param {number} userId 
 * @param {object} profileData - 包含 full_name, address 等要更新的資料
 * @returns {Promise<any>}
 */
async function updateUserProfile(userId, profileData) {
    return await apiRequest(`users.php?user_id=${userId}`, 'PUT', profileData);
}

/**
 * 將使用者登入狀態儲存到瀏覽器
 * @param {object} user - 從登入 API 回傳的使用者物件
 */
function saveUserSession(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * 從瀏覽器獲取當前登入的使用者資訊
 * @returns {object|null}
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * 登出使用者
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
    // 重定向到登入頁面
    window.location.href = 'login.html';
}
