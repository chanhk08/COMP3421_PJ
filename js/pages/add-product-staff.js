document.addEventListener('DOMContentLoaded', () => {
    // 初始化載入分類checkbox
    loadCategoryCheckboxes();

    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNewProduct();
    });
});

async function loadCategoryCheckboxes() {
    const container = document.getElementById('category-checkboxes');
    container.innerHTML = '';

    try {
        const categories = await apiRequest('../PJ/api/categories.php');
        const groups = {};
        categories.forEach(cat => {
            if (!groups[cat.group_name]) groups[cat.group_name] = [];
            groups[cat.group_name].push(cat);
        });

        for (const groupName in groups) {
            const groupCats = groups[groupName];
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('category-group');

            const groupTitle = document.createElement('h3');
            groupTitle.textContent = groupName;
            groupDiv.appendChild(groupTitle);

            groupCats.forEach(cat => {
                const label = document.createElement('label');
                label.style.marginRight = '10px';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = cat.category_id;
                checkbox.name = 'categories';

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${cat.category_name}`));
                groupDiv.appendChild(label);
            });

            container.appendChild(groupDiv);
        }
    } catch (e) {
        container.innerHTML = `<p style="color:red;">Failed to load categories.</p>`;
    }
}

async function saveNewProduct() {
    const form = document.getElementById('product-form');
    const messageDiv = document.getElementById('message');

    // 取得勾選的分類ID
    const selectedCategoryIds = Array.from(form.querySelectorAll('input[name="categories"]:checked'))
        .map(cb => parseInt(cb.value));

    // 建立商品資料物件
    const productData = {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        price: parseFloat(form.price.value),
        stock_quantity: parseInt(form.stock_quantity.value, 10),
        image_url: form.image_url.value.trim(),
        available: form.available.checked ? 1 : 0
    };

    // 簡單資料驗證
    if (!productData.name || isNaN(productData.price) || isNaN(productData.stock_quantity)) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Please provide valid name, price and stock quantity.';
        return;
    }

    try {
        // 新增商品 (POST)
        const res = await fetch('../PJ/api/items.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create product');
        }

        const result = await res.json();
        const newItemId = result.item_id;

        // 新增商品分類關聯
        if (selectedCategoryIds.length > 0) {
            const resCat = await fetch(`../PJ/api/item_categories.php?item_id=${encodeURIComponent(newItemId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_ids: selectedCategoryIds })
            });
            if (!resCat.ok) {
                const err = await resCat.json();
                throw new Error(err.error || 'Failed to assign categories');
            }
        }

        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Product created successfully! Redirecting...';

        // 等待1秒後跳轉回商品列表
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = 'staff_products.html';

    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Error: ' + error.message;
    }
}

// 簡單 API 請求封裝
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
