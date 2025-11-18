document.addEventListener("DOMContentLoaded", () => {
    // 取得並檢查登入用戶
    const currentUserStr = sessionStorage.getItem('currentUser');
    if (!currentUserStr) {
        window.location.href = 'login_staff.html';
        return;
    }
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
        window.location.href = 'login_staff.html';
        return;
    }
    document.getElementById('account-username').textContent = currentUser.username || currentUser.user_id || 'User';

    // 保存篩選條件
    const activeFilters = {
        searchTerm: '',
        categoryIds: new Set()
    };

    // 綁定輸入與按鍵事件
    const searchInput = document.getElementById('search-input');
    const categoryFilterContainer = document.getElementById('category-filters');
    const filterBtn = document.getElementById('filter-btn');
    const resetBtn = document.getElementById('reset-filter-btn');

    filterBtn.addEventListener('click', () => {
        activeFilters.searchTerm = searchInput.value.trim();
        activeFilters.categoryIds = new Set(
            Array.from(categoryFilterContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        );
        fetchProducts(activeFilters);
    });

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilterContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        activeFilters.searchTerm = '';
        activeFilters.categoryIds.clear();
        fetchProducts(activeFilters);
    });

    loadCategoriesAndBuildFilters();
    fetchProducts(activeFilters);

    document.getElementById('logout-btn').addEventListener('click', () => {
        logoutUser();
        window.location.href = 'login_staff.html';
    });

    document.getElementById('add-product-btn').addEventListener('click', () => {
      window.location.href = 'add_product_staff.html';
    });
});

/**
 * 從後端API取得分類資料並動態生成分類多選框
 */
async function loadCategoriesAndBuildFilters() {
    try {
        const categories = await apiRequest('../PJ/api/categories.php');
        if (!Array.isArray(categories)) throw new Error("Invalid categories data");

        const container = document.getElementById('category-filters');
        container.innerHTML = '';

        // 按 group_name 分組
        const groups = {};
        categories.forEach(cat => {
            if (!groups[cat.group_name]) {
                groups[cat.group_name] = [];
            }
            groups[cat.group_name].push(cat);
        });

        // 動態產生多組分類，組間用 "｜" 分隔
        Object.keys(groups).forEach((groupName, index, arr) => {
            const group = groups[groupName];

            const groupDiv = document.createElement('div');
            groupDiv.className = 'category-group';

            const title = document.createElement('strong');
            title.textContent = groupName;
            groupDiv.appendChild(title);

            group.forEach(cat => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = cat.category_id;
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${cat.category_name}`));
                groupDiv.appendChild(label);
            });

            container.appendChild(groupDiv);

            // 除了最後一組，其他組之間加分隔符號
            if (index !== arr.length - 1) {
                const separator = document.createElement('span');
                separator.textContent = ' ';
                container.appendChild(separator);
            }
        });

    } catch (error) {
        const container = document.getElementById('category-filters');
        container.innerHTML = `<p style="color:red;">Error loading filters.</p>`;
    }
}

/**
 * 根據篩選條件呼叫API獲取商品並渲染表格
 * @param {object} filters - 搜尋字串與分類的集合
 */
async function fetchProducts(filters) {
    const messageDiv = document.getElementById("message");
    const tbody = document.querySelector("#products-table tbody");

    try {
        let url = "../PJ/api/items.php";
        const params = new URLSearchParams();

        if (filters.searchTerm) {
            params.append('search', filters.searchTerm);
        }
        if (filters.categoryIds && filters.categoryIds.size > 0) {
            params.append('categories', Array.from(filters.categoryIds).join(','));
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);

        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No products found.</td></tr>";
            messageDiv.textContent = "";
            return;
        }

        tbody.innerHTML = "";

        products.forEach(product => {
            const price = Number(product.price);
            const displayPrice = isNaN(price) ? product.price : price.toFixed(2);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.item_id}</td>
                <td>${product.name}</td>
                <td>$${displayPrice}</td>
                <td>${product.stock_quantity}</td>
                <td>${product.available === 1 || product.available === true ? '<a style="color: green;">Yes</a>' : '<a style="color: red;">No</a>'}</td> <!-- 這裡顯示 available 狀態 -->
                <td><button class='details-btn' onclick="window.location.href='product_details_staff.html?item_id=${product.item_id}'">Details</button></td>
            `;
            tbody.appendChild(tr);
        });
        messageDiv.textContent = "";

    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Error loading products: " + error.message;
        tbody.innerHTML = "";
    }
}

/**
 * 伺服器 API 請求封裝，根據需要自行實作
 */
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
}

/**
 * 登出函數範例
 */
function logoutUser() {
    sessionStorage.removeItem('currentUser');
}
