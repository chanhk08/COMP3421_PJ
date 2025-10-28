/**
 * js/pages/user-profile.js
 * 專門用於初始化與管理 profile.html 頁面
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 檢查登入狀態
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // 未登入則跳轉至登入頁面
        window.location.href = 'login.html';
        return;
    }

    // 2. 初始化導覽列和頁面內容
    initNavigator('nav-links');
    initFooter('footer-container'); 
    await loadUserProfile(currentUser.user_id);
    bindEventListeners(currentUser.user_id);
});

/**
 * 更新導覽列
 * @param {object} user - 當前登入的使用者物件
 */


/**
 * 載入並填充使用者個人資料
 * @param {number} userId - 使用者 ID
 */
async function loadUserProfile(userId) {
    try {
        const profile = await getUserProfile(userId); // 來自 auth.js
        document.getElementById('username').textContent = profile.username;
        document.getElementById('email').textContent = profile.email;
        document.getElementById('full_name').value = profile.full_name || '';
        document.getElementById('address').value = profile.address || '';
        document.getElementById('phone_number').value = profile.phone_number || '';
    } catch (error) {
        document.getElementById('message').textContent = `載入資料失敗: ${error.message}`;
    }
}

/**
 * 為頁面上的按鈕和表單綁定事件監聽器
 * @param {number} userId - 使用者 ID
 */
function bindEventListeners(userId) {
    // 處理表單提交事件
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const profileData = Object.fromEntries(formData.entries());
        const messageDiv = document.getElementById('message');

        try {
            const result = await updateUserProfile(userId, profileData); // 來自 auth.js
            messageDiv.style.color = 'green';
            messageDiv.textContent = result.message || '資料更新成功！';
        } catch (error) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = `更新失敗: ${error.message}`;
        }
    });

    // 處理登出按鈕點擊事件
    document.getElementById('logout-btn').addEventListener('click', () => {
        logoutUser(); // 來自 auth.js
    });
}
