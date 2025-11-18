/**
 * js/pages/order-details.js
 * 處理訂單詳情頁，符合新的資料表欄位設計
 */

//import { initNavigator } from '../modules/navigator.js';
//import { initFooter } from '../modules/footer.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login if not signed in
        window.location.href = 'login.html';
        return;
    }
    initNavigator('nav-links');
    //initFooter('footer-container');

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    console.log('Order ID retrieved:', orderId); // debug

    if (!orderId) {
        document.querySelector('.container').innerHTML = '<h1>Error: Order ID not provided.</h1>';
        return;
    }

    loadOrderDetails(orderId);
});

async function loadOrderDetails(orderId) {
    try {
        const order = await apiRequest(`orders.php?order_id=${orderId}`);
        console.log('API returned order data:', order); // debug

        if (!order || !order.order_id) {
            throw new Error('Order data not found');
        }

        // Populate basic order info
        document.getElementById('order-title').textContent = `Order #${order.order_id} Details`;
        document.getElementById('order-id').textContent = order.order_id;
        document.getElementById('order-date').textContent = new Date(order.order_date).toLocaleString();
        document.getElementById('order-status').textContent = order.status;
        document.getElementById('order-total').textContent = `$${parseFloat(order.total_amount).toFixed(2)}`;

        // Fill shipping information (adapted to updated address fields)
        const fullAddress = [
            order.shipping_address,
            order.shipping_city,
            order.shipping_postal_code
        ].filter(part => part).join(', ');
        document.getElementById('recipient-name').textContent = order.recipient_name;
        document.getElementById('recipient-phone').textContent = order.recipient_phone;
        document.getElementById('shipping-address').textContent = fullAddress;
        document.getElementById('order-remark').textContent = order.remark || '—';

        // Populate order item rows
        const tbody = document.getElementById('order-items-tbody');
        tbody.innerHTML = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
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
            tbody.innerHTML = '<tr><td colspan="4">This order has no items.</td></tr>';
        }

    } catch (error) {
        console.error('載入訂單詳細資料發生錯誤:', error);
        document.querySelector('.container').innerHTML = `<h1>Failed to load order</h1><p style="color:red;">${error.message}</p>`;
    }
}
