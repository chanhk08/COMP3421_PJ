document.addEventListener('DOMContentLoaded', () => {
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

    const accountUsernameElem = document.getElementById('account-username');
    if (accountUsernameElem) {
        accountUsernameElem.textContent = currentUser.username || currentUser.user_id || 'User';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        document.querySelector('.container').innerHTML = '<h1>Error: Order ID not provided.</h1>';
        return;
    }

    loadOrderDetails(orderId);
});

async function loadOrderDetails(orderId) {
    try {
        const order = await apiRequest(`orders.php?order_id=${orderId}`);

        if (!order || !order.order_id) {
            throw new Error('Order data not found');
        }

        document.getElementById('order-title').textContent = `Order #${order.order_id} Details`;
        document.getElementById('order-id').textContent = order.order_id;
        document.getElementById('order-date').textContent = new Date(order.order_date).toLocaleString();
        document.getElementById('order-status').textContent = order.status;
        document.getElementById('order-total').textContent = `$${parseFloat(order.total_amount).toFixed(2)}`;

        const fullAddress = [order.shipping_address, order.shipping_city, order.shipping_postal_code]
            .filter(Boolean)
            .join(', ');
        document.getElementById('recipient-name').textContent = order.recipient_name;
        document.getElementById('recipient-phone').textContent = order.recipient_phone;
        document.getElementById('shipping-address').textContent = fullAddress;
        document.getElementById('order-remark').textContent = order.remark || '—';

        const tbody = document.getElementById('order-items-tbody');
        tbody.innerHTML = '';

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const subtotal = item.price_per_item * item.quantity;
                const row = `
                    <tr>
                        <td>${item.name}</td>
                        <td>$${parseFloat(item.price_per_item).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td class="align-right">$${subtotal.toFixed(2)}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">This order has no items.</td></tr>';
        }
        addStatusUpdater(order.status, order.order_id);

    } catch (error) {
        console.error('Error loading order details:', error);
        document.querySelector('.container').innerHTML = `<h1>Failed to load order</h1><p style="color:red;">${error.message}</p>`;
    }
}


function getNextStatusOptions(currentStatus) {
    const statusFlow = {
        'paid': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'pending': ['paid', 'cancelled'],
        'cancelled': []
    };
    return statusFlow[currentStatus] || [];
}

function createStatusSelect(currentStatus) {
    const select = document.createElement('select');
    select.id = 'status-select';
    select.name = 'status';

    // 當前狀態(不可選)
    const currentOption = document.createElement('option');
    currentOption.value = currentStatus;
    currentOption.textContent = `Current: ${currentStatus}`;
    currentOption.disabled = true;
    currentOption.selected = true;
    select.appendChild(currentOption);

    // 下一步狀態可選
    const nextOptions = getNextStatusOptions(currentStatus);
    nextOptions.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        select.appendChild(option);
    });

    return select;
}

// 在載入訂單詳情後呼叫此函式顯示狀態選單與更新按鈕
function addStatusUpdater(currentStatus, orderId) {
    const container = document.createElement('div');
    container.style.marginTop = '20px';

    const label = document.createElement('text');
    label.for = 'status-select';
    label.textContent = 'Order Status:';
    container.appendChild(label);

    const br = document.createElement('br'); // Create a <br> element
    container.appendChild(br);

    const select = createStatusSelect(currentStatus);
    container.appendChild(select);

    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Update Status';
    updateBtn.style.marginLeft = '10px';
    updateBtn.onclick = async () => {
        const newStatus = select.value;
        if (newStatus === currentStatus) {
            alert('Please select a different status to update.');
            return;
        }
        try {
            let response;
            if (newStatus === 'cancelled') {
                response = await fetch(`../PJ/api/orders.php?action=cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId })
                });
            } else {
                response = await fetch(`../PJ/api/orders.php?order_id=${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            }
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update order status.');
            }
            alert('Order status updated successfully!');
            document.getElementById('order-status').textContent = newStatus;
            container.innerHTML = '';
            addStatusUpdater(newStatus, orderId);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };
    container.appendChild(updateBtn);

    // 放到訂單狀態文字下方
    const statusElem = document.getElementById('order-status');
    statusElem.parentElement.appendChild(container);
}
