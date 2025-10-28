/**
 * js/pages/payment.js
 * (Corrected Return Value Version)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const cartItems = await loadOrderSummary(currentUser.user_id);

    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handlePayment(currentUser.user_id, cartItems);
    });
});


/**
 * Loads and renders the order summary.
 * This function MUST always return an array.
 * @param {number} userId - The ID of the current user.
 * @returns {Promise<Array>} A promise that resolves with the array of cart items.
 */
async function loadOrderSummary(userId) {
    const tbody = document.getElementById('order-items-tbody');
    const totalEl = document.getElementById('order-total');
    const paymentBtn = document.getElementById('confirm-payment-btn');
    
    tbody.innerHTML = '<tr><td colspan="4">Loading order summary...</td></tr>';
    paymentBtn.disabled = true;

    try {
        const cartItems = await getCartItems(userId);
        
        if (!cartItems || cartItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Your shopping cart is empty.</td></tr>';
            return []; // ★ 修正：回傳一個空陣列
        }

        tbody.innerHTML = '';
        let totalAmount = 0;

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

        totalEl.textContent = `$${totalAmount.toFixed(2)}`;
        paymentBtn.disabled = false;

        return cartItems; // ★ 修正：成功時回傳商品陣列

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Failed to load summary: ${error.message}</td></tr>`;
        return []; // ★ 修正：錯誤時也回傳一個空陣列
    }
}


/**
 * Handles the entire order creation and payment process.
 * @param {number} userId 
 * @param {Array} cartItems 
 */
async function handlePayment(userId, cartItems) {
    // ★ 新增：在函式開頭增加一道防線
    if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty. Please add items before proceeding to payment.");
        return;
    }

    const paymentBtn = document.getElementById('confirm-payment-btn');
    const messageDiv = document.getElementById('message');
    
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvc = document.getElementById('card-cvc').value;

    if (!cardNumber || !cardExpiry || !cardCvc) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Please fill out all payment information.';
        return;
    }
    
    paymentBtn.disabled = true;
    messageDiv.style.color = '#007bff';
    messageDiv.textContent = 'Processing payment...';

    try {
        // 現在，傳遞給 apiRequest 的 orderData 中的 items 欄位
        // 一定是一個有效的陣列（即使是空的），不會是 undefined。
        const orderData = {
            user_id: userId,
            shipping_address: "123 Default Address, Hong Kong",
            items: cartItems.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity
            }))
        };
        const orderResult = await apiRequest('orders.php', 'POST', orderData);
        const newOrderId = orderResult.order_id;
        
        // Step 2: Create Payment
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const paymentData = {
            order_id: newOrderId,
            amount: totalAmount,
            payment_method: 'Credit Card',
            transaction_id: 'TXN_' + Date.now(),
            card_last4: cardNumber.slice(-4) 
        };
        await apiRequest('payments.php', 'POST', paymentData);

        // Step 3: Success Actions
        await clearCart(userId);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Payment successful! Redirecting to homepage in 3 seconds.';
        setTimeout(() => { window.location.href = 'index.html'; }, 3000);

    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Processing failed: ${error.message}`;
        paymentBtn.disabled = false;
    }
}
