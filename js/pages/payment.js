/**
 * js/pages/payment.js
 * 處理付款頁面的邏輯
 */

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // 將購物車商品載入到訂單摘要中
    const cartItems = await loadOrderSummary(currentUser.user_id);

    // 為付款表單綁定提交事件
    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault(); // 防止表單傳統提交
        handlePayment(currentUser.user_id, cartItems);
    });
});

/**
 * 處理完整的下單與付款流程
 * @param {number} userId 
 * @param {Array} cartItems - 從購物車獲取的商品陣列
 */

async function loadOrderSummary(userId) {
    // 獲取將要操作的 DOM 元素
    const tbody = document.getElementById('order-items-tbody');
    const totalEl = document.getElementById('order-total');
    const paymentBtn = document.getElementById('confirm-payment-btn');
    
    // 顯示初始的載入中訊息
    tbody.innerHTML = '<tr><td colspan="4">正在載入訂單摘要...</td></tr>';
    paymentBtn.disabled = true; // 載入完成前禁用付款按鈕

    try {
        // 呼叫 cart.js 中的函式來獲取購物車內容
        const cartItems = await getCartItems(userId);
        
        // 情況一：購物車為空
        if (!cartItems || cartItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">您的購物車是空的，無法結帳。</td></tr>';
            totalEl.textContent = '$0.00';
            // 保持付款按鈕禁用
            return []; // 回傳空陣列
        }

        // 情況二：成功獲取商品，開始渲染
        tbody.innerHTML = ''; // 清空「載入中」提示
        let totalAmount = 0;

        // 遍歷每一個商品，建立表格的一行
        cartItems.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalAmount += subtotal;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${subtotal.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        // 更新總金額
        totalEl.textContent = `$${totalAmount.toFixed(2)}`;
        paymentBtn.disabled = false; // 啟用付款按鈕

        // 將獲取到的商品陣列回傳，供 handlePayment 函式使用
        return cartItems;

    } catch (error) {
        // 情況三：API 請求失敗
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">載入訂單摘要失敗: ${error.message}</td></tr>`;
        totalEl.textContent = '$0.00';
        // 保持付款按鈕禁用
        return []; // 回傳空陣列
    }
}

async function handlePayment(userId, cartItems) {
    const paymentBtn = document.getElementById('confirm-payment-btn');
    const messageDiv = document.getElementById('message');
    
    // --- ★ 新增：讀取並驗證信用卡資訊 ---
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvc = document.getElementById('card-cvc').value;

    if (!cardNumber || !cardExpiry || !cardCvc) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = '請填寫所有信用卡資訊。';
        return;
    }
    
    paymentBtn.disabled = true;
    messageDiv.style.color = '#007bff';
    messageDiv.textContent = '正在處理付款，請稍候...';

    // --- 建立訂單並付款的流程 ---
    try {
        const orderData = { /* ... */ };
        const orderResult = await apiRequest('orders.php', 'POST', orderData);
        const newOrderId = orderResult.order_id;
        
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // --- ★ 修改：將（模擬的）信用卡資訊加入請求中 ---
        const paymentData = {
            order_id: newOrderId,
            amount: totalAmount,
            payment_method: 'Credit Card',
            transaction_id: 'TXN_' + Date.now(),
            // 在真實應用中，這裡應該是支付閘道回傳的 token，而非原始卡號
            card_last4: cardNumber.slice(-4) 
        };

        await apiRequest('payments.php', 'POST', paymentData);

        // --- 第 3 步：清空購物車並顯示成功訊息 ---
        await clearCart(userId);
        
        messageDiv.style.color = 'green';
        messageDiv.textContent = '付款成功！感謝您的購買。頁面將在 3 秒後跳轉回首頁。';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `處理失敗：${error.message}`;
        paymentBtn.disabled = false; // 讓使用者可以重試
    }
}
