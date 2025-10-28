/**
 * js/pages/order-details.js
 * 處理單筆訂單詳情的頁面邏輯
 */

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    initNavigator('nav-links');
    initFooter('footer-container'); 
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        document.querySelector('.container').innerHTML = '<h1>錯誤：未提供訂單編號。</h1>';
        return;
    }
    
    await loadOrderDetails(orderId);
});

async function loadOrderDetails(orderId) {
    const container = document.querySelector('.container');
    try {
        const orderData = await apiRequest(`orders.php?order_id=${orderId}`);

        // 填充訂單主體資訊
        document.getElementById('order-title').textContent = `訂單 #${orderData.order_id} 詳情`;
        document.getElementById('order-status').textContent = orderData.status;
        document.getElementById('order-total').textContent = `$${parseFloat(orderData.total_amount).toFixed(2)}`;

        // 填充商品項目列表
        const tbody = document.getElementById('order-items-tbody');
        tbody.innerHTML = ''; // 清空載入提示
        
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => {
                const subtotal = item.price_per_item * item.quantity;
                const row = `
                    <tr>
                        <td>${item.name}</td>
                        <td>$${parseFloat(item.price_per_item).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td class="align-right">$${subtotal.toFixed(2)}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">此訂單無商品項目。</td></tr>';
        }

    } catch (error) {
        container.innerHTML = `<h1>載入訂單失敗</h1><p style="color:red;">${error.message}</p>`;
    }
}