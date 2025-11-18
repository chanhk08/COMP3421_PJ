document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    initNavigator('nav-links');
    const cartItems = await loadOrderSummary(currentUser.user_id);
    const paymentForm = document.getElementById('payment-form');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCheckout(currentUser.user_id, cartItems);
        });
    }
});

async function loadOrderSummary(userId) {
    // This function from your file is correct and requires no changes.
    // We assume it works as intended.
    const tbody = document.getElementById('order-items-tbody');
    const totalEl = document.getElementById('order-total');
    const paymentBtn = document.getElementById('confirm-payment-btn');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    paymentBtn.disabled = true;
    try {
        const cartItems = await getCartItems(userId);
        if (!cartItems || cartItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cart is empty.</td></tr>';
            return [];
        }
        tbody.innerHTML = '';
        let totalAmount = 0;
        cartItems.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalAmount += subtotal;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.name}</td><td>$${parseFloat(item.price).toFixed(2)}</td><td>${item.quantity}</td><td>$${subtotal.toFixed(2)}</td>`;
            tbody.appendChild(row);
        });
        totalEl.textContent = `$${totalAmount.toFixed(2)}`;
        paymentBtn.disabled = false;
        return cartItems;
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red;">Error: ${error.message}</td></tr>`;
        return [];
    }
}

/**
 * ★★★ THE FINAL, CORRECTED CHECKOUT HANDLER ★★★
 * This function now reads from YOUR HTML and builds the CORRECT data structure.
 */
async function handleCheckout(userId, cartItems) {
    // 1. 取得用戶輸入資料
    const fullName = document.getElementById('full_name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const addressLine = document.getElementById('address_line').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postal_code').value.trim();
    const remark = document.getElementById('remark').value.trim();

    const cardNumber = document.getElementById('card-number').value.trim();
    const cardExpiry = document.getElementById('card-expiry').value.trim();
    const cardCVC = document.getElementById('card-cvc').value.trim();
    const cardName = document.getElementById('card-name').value.trim();

    // 2. 簡單驗證
    if (!fullName || !phone || !addressLine || !city || !postalCode ||
        !cardNumber || !cardExpiry || !cardCVC || !cardName) {
        displayMessage('Please complete all required fields.', true);
        return;
    }

    if (!cartItems || cartItems.length === 0) {
        displayMessage('Your cart is empty. Cannot complete checkout.', true);
        return;
    }

    // 3. 計算總金額
    let totalAmount = 0;
    cartItems.forEach(item => {
        totalAmount += item.price * item.quantity;
    });

    // 4. 付款前檢查商品庫存
    try {
        for (const item of cartItems) {
            const res = await fetch(`../PJ/api/items.php?item_id=${item.item_id}`);
            if (!res.ok) {
                throw new Error(`Failed to check stock for item ID ${item.item_id}`);
            }
            const itemData = await res.json();
            if (itemData.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for "${itemData.name}"`);
            }
        }
    } catch (error) {
        displayMessage(error.message, true);
        return;
    }

    // 5. 組裝訂單資料
    const orderData = {
        userId: userId,
        recipientName: fullName,
        recipientPhone: phone,
        shippingAddress: addressLine,
        shippingCity: city,
        shippingPostalCode: postalCode,
        remark: remark,
        items: cartItems.map(item => ({
            itemId: item.item_id || item.id,
            quantity: item.quantity,
            pricePerItem: item.price
        })),
        paymentMethod: 'credit_card',
        cardInfo: {
            number: cardNumber,
            expiry: cardExpiry,
            cvc: cardCVC,
            name: cardName
        }
    };

    // 6. 呼叫後端建立訂單
    try {
        const response = await fetch('../PJ/api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            displayMessage(`Order created successfully! Order ID: ${result.orderId}`);

            // 清除購物車
            await clearCart(userId);

            // 跳轉至訂單詳情頁
            window.location.href = `order_details.html?order_id=${result.orderId}`;
        } else {
            displayMessage(`Failed to create order: ${result.error || 'Unknown error'}`, true);
        }
    } catch (error) {
        displayMessage(`Network error: ${error.message}`, true);
    }
}

// 需要你實作清空購物車的函式
async function clearCart(userId) {
    try {
        // 假設有 API 支援刪除購物車所有項目，或其他清空邏輯
        await fetch(`../PJ/api/cart.php?user_id=${userId}`, {
            method: 'DELETE'
        });
    } catch (e) {
        console.error('Failed to clear cart', e);
    }
}


function displayMessage(msg, isError = false) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        // If the page doesn't contain a message element, fall back to alert
        alert(msg);
        return;
    }
    messageDiv.style.color = isError ? '#dc3545' : '#28a745'; // error:red success:green
    messageDiv.textContent = msg;
    // Clear the message after 3 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
}

async function checkStock(cartItems) {
    for (const item of cartItems) {
        const res = await fetch(`../PJ/api/items.php?item_id=${item.item_id}`);
        if (!res.ok) {
            throw new Error(`Failed to check stock for item ID ${item.item_id}`);
        }
        const itemData = await res.json();
        if (itemData.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${itemData.name}`);
        }
    }
}