/**
 * js/pages/index.js
 * 調整後：按鈕保留原樣，但點擊跳轉查看詳情
 */

(function() {
    const activeFilters = {
        searchTerm: '',
        categoryIds: new Set()
    };
    initNavigator('nav-links');
    console.log(getCurrentUser());
    initFooter('footer-container'); 
    function initializePage() {
        console.log("DOM ready. Initializing page...");
        setupEventListeners();
        loadCategoriesAndBuildFilters();
        fetchAndRenderProducts();
    }

    function setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const categoryFiltersContainer = document.getElementById('category-filters');
        const productList = document.getElementById('product-list');

        // 搜尋輸入框事件，節流防抖
        searchInput.addEventListener('input', debounce(e => {
            activeFilters.searchTerm = e.target.value.trim();
            fetchAndRenderProducts();
        }, 300));

        // 分類篩選 checkbox
        categoryFiltersContainer.addEventListener('change', e => {
            if (e.target.type === 'checkbox') {
                const categoryId = parseInt(e.target.value, 10);
                e.target.checked ? activeFilters.categoryIds.add(categoryId) : activeFilters.categoryIds.delete(categoryId);
                fetchAndRenderProducts();
            }
        });

        // 事件委派監聽商品列表裡的「查看詳情」按鈕 (原按鈕樣式)
        productList.addEventListener('click', e => {
            if (e.target && e.target.matches('.add-to-cart-btn')) {
                const itemId = e.target.dataset.itemId;
                window.location.href = `product_detail.html?id=${itemId}`;
            }
        });
    }

    async function loadCategoriesAndBuildFilters() {
        console.log("Attempting to load categories...");
        try {
            const categories = await apiRequest('../api/categories.php');
            if (!Array.isArray(categories)) throw new Error("API did not return a valid array.");

            const containers = {
                'Pet Type': document.getElementById('filter-pet-type'),
                'Product Type': document.getElementById('filter-product-type'),
                'Life Stage': document.getElementById('filter-life-stage')
            };
            
            Object.values(containers).forEach(c => c.innerHTML = '');

            if (categories.length === 0) return;

            categories.forEach(category => {
                const container = containers[category.group_name];
                if (container) {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = category.category_id;
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(` ${category.category_name}`));
                    container.appendChild(label);
                }
            });
        } catch (error) {
            document.getElementById('category-filters').innerHTML = `<p style="color:red;">Error loading filters.</p>`;
        }
    }

    async function fetchAndRenderProducts() {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '<p>Loading...</p>';

        try {
            const params = new URLSearchParams();

            if (activeFilters.searchTerm) {
                params.append('search', activeFilters.searchTerm);
            }
            if (activeFilters.categoryIds.size > 0) {
                // categories 參數為逗號分隔的分類ID字串
                params.append('categories', Array.from(activeFilters.categoryIds).join(','));
            }

            // 使用相對路徑或根路徑的 api 路徑，視你的 API 基本路徑決定
            const url = `../api/items.php?${params.toString()}`;

            const products = await apiRequest(url);

            productList.innerHTML = '';

            const availableProducts = products.filter(product => product.available === 1 || product.available === true);

            if (availableProducts.length === 0) {
                productList.innerHTML = '<p>No available products found.</p>';
                return;
            }
            
            availableProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" />
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                    <button class="add-to-cart-btn" data-item-id="${product.item_id}">Details</button>
                `;
                productList.appendChild(card);
            });
        } catch (error) {
            productList.innerHTML = `<p style="color:red;">Error loading products: ${error.message}</p>`;
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    document.addEventListener('DOMContentLoaded', initializePage);
})();
