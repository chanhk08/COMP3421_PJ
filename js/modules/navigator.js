/**
 * js/modules/navigator.js
 * 動態初始化網站導覽列 (Navbar)
 *
 * 這個模組提供一個函式 initNavigator()，供各個頁面調用。
 * 它會檢查使用者登入狀態，並在指定的容器中生成對應的選單。
 */

/**
 * 初始化導覽列
 * @param {string} containerId - 用於放置導覽列連結的容器元素的 ID (例如 'nav-links')
 */
function initNavigator(containerId) {
    const navLinksContainer = document.getElementById(containerId);
    if (!navLinksContainer) {
        console.error(`Navigator container with id "${containerId}" not found.`);
        return;
    }

    const currentUser = getCurrentUser(); // 來自 auth.js

    // 根據登入狀態生成不同的 HTML 內容
    if (currentUser) {
        // 已登入狀態
        navLinksContainer.innerHTML = `
            <a href="index.html">Home</a>
            <a href="cart.html">Cart</a>
            <a href="order_record.html">History</a>
            <a href="user_profile.html" class="profile-link">Welcome, ${currentUser.username}</a>
            <button id="logout-btn-nav">Logout</button>
        `;
        // 為登出按鈕綁定事件
        document.getElementById('logout-btn-nav').addEventListener('click', () => {
            logoutUser(); // 來自 auth.js
        });
    } else {
        // 未登入狀態
        navLinksContainer.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}
