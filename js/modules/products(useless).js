/**
 * 載入商品並顯示在頁面上
 * @param {string} [keyword=''] - 搜尋關鍵字，預設為空字串
 */
async function loadAllProducts(keyword = '', categoryIds = []) {
    const productListContainer = document.getElementById('product-list');
    if (!productListContainer) return;

    productListContainer.innerHTML = '<p>正在載入商品...</p>';

    try {
        const queryParams = {};
        if (keyword) queryParams.search = keyword;
        if (categoryIds.length > 0) queryParams.categories = categoryIds.join(',');

        const products = await apiRequest('items.php', 'GET', queryParams);

        productListContainer.innerHTML = '';

        const availableProducts = products.filter(product => product.available === 1 || product.available === true);
        if (availableProducts.length === 0) {
            productListContainer.innerHTML = `<p>找不到符合條件的商品。</p>`;
            return;
        }

        availableProducts.forEach(product => {
            const productCard = createProductCard(product);
            productListContainer.appendChild(productCard);
        });
    } catch (error) {
        productListContainer.innerHTML = `<p style="color: red;">載入商品失敗: ${error.message}</p>`;
    }
}

/**
 * 根據一個商品物件，建立對應的 HTML 元素 (卡片)
 * @param {object} product - 商品資料物件
 * @returns {HTMLElement} - 代表商品卡片的 div 元素
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // 商品圖片本身就是一個指向詳情頁的連結
    const imageLink = document.createElement('a');
    imageLink.href = `product_detail.html?id=${product.item_id}`;
    imageLink.innerHTML = `<img src="${product.image_url || 'https://via.placeholder.com/250?text=No+Image'}" alt="${product.name}" class="product-image">`;

    // 商品資訊區塊
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';
    infoDiv.innerHTML = `
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
        <span class="stock-status ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock_quantity > 0 ? `In stock (${product.stock_quantity})` : 'Sold out'}
        </span>
    `;

    // ★ 修改重點：「查看詳情」按鈕現在是一個連結
    const detailLink = document.createElement('a');
    detailLink.href = `product_detail.html?id=${product.item_id}`;
    detailLink.className = 'view-detail-link'; // use new class for styling
    detailLink.textContent = 'View Details';

    // 將所有部分組合起來
    card.appendChild(imageLink);
    card.appendChild(infoDiv);
    card.appendChild(detailLink);
    
    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    // 只在存在 search-input 的頁面執行
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const keyword = searchInput.value.trim();
                loadAllProducts(keyword);
            }, 300);
        });
    }
});