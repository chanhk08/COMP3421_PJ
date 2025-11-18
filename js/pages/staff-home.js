let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = 'login_staff.html';
        return;
    }
    document.getElementById('account-username').textContent = currentUser.username || currentUser.user_id || 'User';
    fetchOrders();

document.getElementById('search-btn').addEventListener('click', () => {
    const type = document.getElementById('search-type').value;
    const input = document.getElementById('search-input').value.trim();

    const statusCheckboxes = document.querySelectorAll('#status-filters input[type="checkbox"]');
    const selectedStatuses = Array.from(statusCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (!input) {
        fetchOrders(null, null, selectedStatuses);
    } else {
        fetchOrders(type, input, selectedStatuses);
    }
});


    document.getElementById('logout-btn').addEventListener('click', () => {
        logoutUser();
        window.location.href = 'login_staff.html';
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';

        const statusCheckboxes = document.querySelectorAll('#status-filters input[type="checkbox"]');
        statusCheckboxes.forEach(cb => {
            cb.checked = true;
        });

        fetchOrders();
    });
});


async function fetchOrders(searchType, searchValue, selectedStatuses = []) {
    const messageDiv = document.getElementById("message");
    const tbody = document.querySelector("#orders-table tbody");

    try {
        let url = "../PJ/api/orders.php";
        if (searchType && searchValue) {
            url += `?${encodeURIComponent(searchType)}=${encodeURIComponent(searchValue)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);

        const orders = await response.json();
        const ordersArray = Array.isArray(orders) ? orders : (orders.order_id ? [orders] : []);

        let filteredOrders = ordersArray;
        if (selectedStatuses.length > 0) {
            filteredOrders = ordersArray.filter(order => selectedStatuses.includes(order.status));
        }

        if (!filteredOrders.length) {
            tbody.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
            updateDashboardStats([]);
            return;
        }
        allOrders = filteredOrders; 

        renderOrders(allOrders);
        updateDashboardStats(allOrders);
        messageDiv.textContent = "";

    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Error loading orders: " + error.message;
        tbody.innerHTML = "";
        updateDashboardStats([]);
    }
}


function renderOrders(orders) {
    const tbody = document.querySelector("#orders-table tbody");
    if (!orders.length) {
        tbody.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
        return;
    }
    tbody.innerHTML = "";
    orders.forEach((order) => {
        const createdAt = new Date(order.order_date || order.created_at).toLocaleString("zh-HK");
        const totalAmount = parseFloat(order.total_amount);
        const displayAmount = isNaN(totalAmount) ? order.total_amount : totalAmount.toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.user_id || ''}</td>
            <td>${order.recipient_name || ''}</td>
            <td>$${displayAmount}</td>
            <td>${order.status}</td>
            <td>${createdAt}</td>
            <td>
                <button class='details-btn' onclick="window.location.href='order_details_staff.html?order_id=${order.order_id}'">Details</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


async function updateDashboardStats(orders) {
    const total = orders.length;
    let pending = 0;
    let shipped = 0;
    let paid = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach(o => {
        switch (o.status) {
            case 'pending': pending++; break;
            case 'paid': paid++; break;
            case 'shipped': shipped++; break;
            case 'delivered': delivered++; break;
            case 'cancelled': cancelled++; break;
        }
    });

    const totalElem = document.getElementById('total-orders');
    const pendingElem = document.getElementById('pending-orders');
    const paidElem = document.getElementById('paid-orders');
    const shippedElem = document.getElementById('shipped-orders');
    const deliveredElem = document.getElementById('delivered-orders');
    const cancelledElem = document.getElementById('cancelled-orders');

    if (totalElem) totalElem.textContent = total;
    if (pendingElem) pendingElem.textContent = pending;
    if (paidElem) paidElem.textContent = paid;
    if (shippedElem) shippedElem.textContent = shipped;
    if (deliveredElem) deliveredElem.textContent = delivered;
    if (cancelledElem) cancelledElem.textContent = cancelled;
}
