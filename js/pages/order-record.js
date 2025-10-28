/**
 * js/pages/order-record.js
 * 專門用於初始化與管理 order_record.html 頁面
 */

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // 未登入則跳轉至登入頁面
        window.location.href = 'login.html';
        return;
    }

    initNavigator('nav-links');
    initFooter('footer-container'); 
    await loadUserOrders(currentUser.user_id);
});

/**
 * 更新導覽列的登入狀態
 * @param {object} user - 當前登入的使用者物件
 */
/**
 * 載入並顯示指定使用者的所有訂單
 * @param {number} userId - 使用者 ID
 */
async function loadUserOrders(userId) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '<tr><td colspan="4">正在載入您的訂單紀錄...</td></tr>';

    try {
        const orders = await apiRequest(`orders.php?user_id=${userId}`);
        
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="order-empty">您目前沒有任何訂單紀錄。</td></tr>';
            return;
        }

        tbody.innerHTML = ''; // 清空載入提示

        orders.forEach(order => {
            const tr = document.createElement('tr');
            // 將 PHP 回傳的日期格式化為本地習慣的日期時間格式
            const orderDate = new Date(order.order_date).toLocaleString('zh-HK');
            
            tr.innerHTML = `
                <td><a href="order_details.html?order_id=${order.order_id}">${order.order_id}</a></td>
                <td>${orderDate}</td>
                <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>${order.status}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red;">載入訂單失敗: ${error.message}</td></tr>`;
    }
}
