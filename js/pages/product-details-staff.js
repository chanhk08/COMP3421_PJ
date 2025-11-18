document.addEventListener("DOMContentLoaded", () => {
    let originalProduct = null;
    let originalCategoryIds = [];
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('item_id');
    if (!itemId) {
        document.getElementById('message').textContent = 'No product ID specified.';
        return;
    }

    fetchProductDetails(itemId);

    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProductDetails();
    });
});

async function fetchProductDetails(itemId) {
    try {
        const responseProduct = await fetch(`../PJ/api/items.php?item_id=${encodeURIComponent(itemId)}`);
        if (!responseProduct.ok) throw new Error('Failed to fetch product data');
        const product = await responseProduct.json();
        
        const responseCategories = await fetch(`../PJ/api/item_categories.php?item_id=${encodeURIComponent(itemId)}`);
        const categoryIds = responseCategories.ok ? await responseCategories.json() : [];

        // 保存原始資料
        originalProduct = product;
        originalCategoryIds = categoryIds.slice();

        const form = document.getElementById('product-form');
        form.item_id.value = product.item_id || '';
        form.name.value = product.name || '';
        form.description.value = product.description || '';
        form.price.value = product.price || '';
        form.stock_quantity.value = product.stock_quantity || '';
        form.image_url.value = product.image_url || '';
        form.available.checked = product.available === 1 || product.available === true;
        
        await loadCategoryCheckboxes(categoryIds);
    } catch (error) {
        document.getElementById('message').textContent = error.message;
    }
}

async function saveProductDetails() {
    const form = document.getElementById('product-form');
    const messageDiv = document.getElementById('message');

    const selectedCategoryIds = Array.from(form.querySelectorAll('input[name="categories"]:checked'))
        .map(cb => parseInt(cb.value));

    const productChanged = isProductChanged(form, originalProduct);
    const categoryChanged = !isArrayEqual(selectedCategoryIds, originalCategoryIds);

    if (!productChanged && !categoryChanged) {
        messageDiv.style.color = "orange";
        messageDiv.textContent = "No changes detected.";
        return;
    }

    try {
        if (productChanged) {
            const productData = {
                name: form.name.value.trim(),
                description: form.description.value.trim(),
                price: parseFloat(form.price.value),
                stock_quantity: parseInt(form.stock_quantity.value, 10),
                image_url: form.image_url.value.trim(),
                available: form.available.checked ? 1 : 0
            };

            const res = await fetch(`../PJ/api/items.php?item_id=${encodeURIComponent(form.item_id.value)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Product update failed');
            }
        }

        if (categoryChanged) {
            const res = await fetch(`../PJ/api/item_categories.php?item_id=${encodeURIComponent(form.item_id.value)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_ids: selectedCategoryIds })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Category update failed');
            }
        }

        messageDiv.style.color = "green";
        messageDiv.textContent = "Update successful.";

        // 更新原始資料為最新狀態
        originalProduct = {
            name: form.name.value.trim(),
            description: form.description.value.trim(),
            price: parseFloat(form.price.value),
            stock_quantity: parseInt(form.stock_quantity.value, 10),
            image_url: form.image_url.value.trim()
        };
        originalCategoryIds = selectedCategoryIds.slice();

        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = 'staff_products.html'; 
    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Error: " + error.message;
    }
}

async function loadCategoryCheckboxes(selectedCategoryIds = []) {
    const container = document.getElementById('category-checkboxes');
    container.innerHTML = ''; // 清空容器

    try {
        const categories = await apiRequest('../api/categories.php');

        // 按 group_name 分組
        const groups = {};
        categories.forEach(cat => {
            if (!groups[cat.group_name]) {
                groups[cat.group_name] = [];
            }
            groups[cat.group_name].push(cat);
        });

        // 依 group_name 逐組建立區塊
        for (const groupName in groups) {
            const groupCats = groups[groupName];

            const groupDiv = document.createElement('div');
            groupDiv.classList.add('category-group');

            // 分組標題
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = groupName;
            groupDiv.appendChild(groupTitle);

            // 這組分類的checkbox清單
            groupCats.forEach(cat => {
                const label = document.createElement('label');
                label.style.marginRight = '10px';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = cat.category_id;
                checkbox.name = 'categories';

                if (selectedCategoryIds.includes(cat.category_id)) {
                    checkbox.checked = true;
                }

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

async function saveCategoryRelations(itemId, categoryIds) {
    const res = await fetch(`../PJ/api/item_categories.php?item_id=${encodeURIComponent(itemId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_ids: categoryIds })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update categories');
    }
}

function isProductChanged(form, original) {
    return form.name.value.trim() !== (original.name || '') ||
           form.description.value.trim() !== (original.description || '') ||
           parseFloat(form.price.value) !== parseFloat(original.price) ||
           parseInt(form.stock_quantity.value, 10) !== parseInt(original.stock_quantity, 10) ||
           form.image_url.value.trim() !== (original.image_url || '') ||
           (form.available.checked ? 1 : 0) !== (original.available ? 1 : 0);  
}

function isArrayEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = arr1.slice().sort();
    const sorted2 = arr2.slice().sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
}
