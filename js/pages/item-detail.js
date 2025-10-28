/**
 * js/pages/item-detail.js
 * 專門用於初始化與管理 item_detail.html 頁面，支援數量輸入
 */

// 頁面載入時的總入口
document.addEventListener('DOMContentLoaded', async () => {
    initNavigator('nav-links');
    initFooter('footer-container'); 
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        displayError('錯誤：網址中缺少商品 ID。');
        return;
    }

    try {
        const product = await apiRequest(`items.php?item_id=${itemId}`);
        renderProductDetails(product);
        bindAddToCartEvent(product);
    } catch (error) {
        displayError(`載入商品失敗：${error.message}`);
    }
});

function renderProductDetails(product) {
    document.title = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-image').src = product.image_url || 'https://via.placeholder.com/400?text=No+Image';
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
    document.getElementById('product-description').textContent = product.description || '此商品沒有詳細描述。';
    
    const stockStatusDiv = document.getElementById('stock-status');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quantityInput = document.getElementById('quantity-input');

    if (product.stock_quantity > 0) {
        stockStatusDiv.textContent = `庫存狀態：有貨 (剩餘 ${product.stock_quantity} 件)`;
        stockStatusDiv.className = 'stock-status in-stock';
        addToCartBtn.disabled = false;
        quantityInput.disabled = false;
        quantityInput.max = product.stock_quantity; // ★ 設定最大可購買數量
    } else {
        stockStatusDiv.textContent = '庫存狀態：已售罄';
        stockStatusDiv.className = 'stock-status out-of-stock';
        addToCartBtn.disabled = true;
        quantityInput.disabled = true;
    }
}

function bindAddToCartEvent(product) {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.addEventListener('click', async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('請先登入才能將商品加入購物車。');
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
            return;
        }

        const quantityInput = document.getElementById('quantity-input');
        let quantity = parseInt(quantityInput.value);

        // ★ 驗證輸入的數量
        if (isNaN(quantity) || quantity < 1) {
            alert('請輸入有效的購買數量。');
            quantityInput.value = 1; // 重設為 1
            return;
        }
        if (quantity > product.stock_quantity) {
            alert(`庫存不足！此商品最多只能購買 ${product.stock_quantity} 件。`);
            quantityInput.value = product.stock_quantity; // 自動修正為最大庫存量
            return;
        }

        try {
            // ★ 將使用者輸入的數量傳給 API
            await addCartItem(currentUser.user_id, product.item_id, quantity);
            displayMessage(`已將 ${quantity} 件「${product.name}」成功加入購物車！`);
        } catch (error) {
            displayMessage(`加入購物車失敗：${error.message}`, true);
        }
    });
}

/**
 * 在頁面上顯示臨時訊息
 * @param {string} msg - 要顯示的訊息
 * @param {boolean} isError - 是否為錯誤訊息
 */
function displayMessage(msg, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = isError ? '#dc3545' : '#28a745';
    messageDiv.textContent = msg;
    setTimeout(() => { messageDiv.textContent = ''; }, 3000);
}

/**
 * 在頁面上顯示永久的錯誤訊息
 * @param {string} msg - 錯誤訊息
 */
function displayError(msg) {
    const container = document.querySelector('.container');
    container.innerHTML = `<p style="color:red; text-align:center;">${msg}</p>`;
}
