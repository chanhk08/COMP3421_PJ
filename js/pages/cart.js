document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // 載入導覽列登入狀態
    initNavigator('nav-links');
    // 載入購物車內容
    loadCartView(currentUser.user_id);
    initFooter('footer-container'); 
});


// 載入並渲染購物車視圖
async function loadCartView(userId) {
    const cartContainer = document.getElementById('cart-content');
    cartContainer.innerHTML = '<p>Loading...</p>';
    try {
        const items = await getCartItems(userId);
        renderCart(items, userId);
    } catch (error) {
        cartContainer.innerHTML = `<p style="color:red;">Shopping cart failed to load: ${error.message}</p>`;
    }
}

// 渲染購物車的 HTML
function renderCart(items, userId) {
    const cartContainer = document.getElementById('cart-content');
    if (items.length === 0) {
        cartContainer.innerHTML = '<div class="cart-empty"><p>Your shopping cart is empty.</p><a href="index.html">Go shopping</a></div>';
        return;
    }
    
    let totalAmount = 0;
    cartContainer.innerHTML = `
        <div class="cart-header">
            <div class="cart-item-info">Item</div>
            <div class="cart-item-price">Price</div>
            <div class="cart-item-quantity">Quantity</div>
            <div class="cart-item-total">Sub Totel</div>
            <div class="cart-item-actions"></div>
        </div>
    `;
    
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">${item.name}</div>
            <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
            <div class="cart-item-quantity">
                <input type="number" value="${item.quantity}" min="1" data-item-id="${item.item_id}">
            </div>
            <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
            <div class="cart-item-actions">
                <button class="remove-btn" data-item-id="${item.item_id}">✕</button>
            </div>
        `;
        cartContainer.appendChild(itemDiv);
    });
    
    // 加上總計和清空購物車按鈕
    cartContainer.innerHTML += `
        <div class="cart-footer">
            <div><button class="clear-cart-btn">Emply Cart</button></div>
            <div class="checkout-actions">
                <strong>Totel: $${totalAmount.toFixed(2)}</strong>
                <button id="checkout-btn">Checkout</button>
            </div>
        </div>
    `;
    
    addCartEventListeners(userId);
}

// 為購物車中的所有互動元素新增事件監聽器
function addCartEventListeners(userId) {
    const cartContainer = document.getElementById('cart-content');
    cartContainer.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('remove-btn')) {
            const itemId = target.dataset.itemId;
            await removeCartItem(userId, itemId);
            loadCartView(userId); // 重新載入購物車
        } else if (target.classList.contains('clear-cart-btn')) {
            if (confirm('Are you sure to emply the whole cart?')) {
                await clearCart(userId);
                loadCartView(userId); // 重新載入購物車
            }
        } else if(target.id === 'checkout-btn') {
            // 跳轉到付款頁面
            window.location.href = 'payment.html';
        }
    });
    cartContainer.addEventListener('change', async (event) => {
        const target = event.target;
        if (target.matches('input[type="number"]')) {
            const itemId = target.dataset.itemId;
            const newQuantity = parseInt(target.value);
            if (newQuantity > 0) {
                await updateCartItem(userId, itemId, newQuantity);
                loadCartView(userId); // 重新載入購物車
            }
        }
    });
}