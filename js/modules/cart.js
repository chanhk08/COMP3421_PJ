/**
 * js/cart.js
 * 處理購物車資料的獲取與修改
 * 依賴於 api.js 中的 apiRequest 函式
 */

/**
 * 獲取指定使用者的購物車內容
 * @param {number} userId 
 * @returns {Promise<Array>} 購物車商品陣列
 */
async function getCartItems(userId) {
    // GET 請求會將 user_id 作為 URL 查詢參數
    return await apiRequest(`cart.php?user_id=${encodeURIComponent(userId)}`, 'GET');
}

/**
 * 將商品新增至購物車
 * @param {number} userId 
 * @param {number} itemId 
 * @param {number} quantity 
 * @returns {Promise<object>}
 */
async function addCartItem(userId, itemId, quantity) {
    // POST 請求將資料放在 request body 中
    return await apiRequest('cart.php', 'POST', { user_id: userId, item_id: itemId, quantity: quantity });
}

/**
 * 更新購物車中商品的數量
 * @param {number} userId 
 * @param {number} itemId 
 * @param {number} quantity 
 * @returns {Promise<object>}
 */
async function updateCartItem(userId, itemId, quantity) {
    // PUT 請求將資料放在 request body 中
    return await apiRequest('cart.php', 'PUT', { user_id: userId, item_id: itemId, quantity: quantity });
}

/**
 * 從購物車中移除單一商品
 * @param {number} userId 
 * @param {number} itemId 
 * @returns {Promise<object>}
 */
async function removeCartItem(userId, itemId) {
    // DELETE 請求將資料放在 request body 中
    return await apiRequest('cart.php', 'DELETE', { user_id: userId, item_id: itemId });
}

/**
 * 清空指定使用者的整個購物車
 * @param {number} userId 
 * @returns {Promise<object>}
 */
async function clearCart(userId) {
    // 對於清空操作，將 user_id 作為 URL 參數
    return await apiRequest(`cart.php?user_id=${encodeURIComponent(userId)}`, 'DELETE');
}
