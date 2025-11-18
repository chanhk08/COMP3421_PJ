document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired');

    const currentUserStr = sessionStorage.getItem('currentUser');
    if (!currentUserStr) {
        alert('No user logged in');
        window.location.href = 'login_staff.html';
        return;
    }

    const currentUser = JSON.parse(currentUserStr);

    document.getElementById('account-username').textContent = currentUser.username || currentUser.user_id || 'User';

    document.getElementById('logout-btn').addEventListener('click', () => {
        logoutUser();
        window.location.href = 'login_staff.html';
    });

    try {
        const response = await fetch(`../PJ/api/users.php?user_id=${encodeURIComponent(currentUser.user_id)}`);
        if (!response.ok) throw new Error('Failed to load user data.');

        const user = await response.json();

        // 確保表單存在
        const form = document.getElementById('profile-form');
        if (!form) {
            console.error('profile-form not found');
            return;
        }

        // 映射欄位ID到後端欄位名稱
        const mapFields = {
            username: 'username',
            fullname: 'full_name',
            email: 'email',
            phone: 'phone_number'
        };

        // 自動填入欄位
        Object.entries(mapFields).forEach(([inputId, userKey]) => {
            const inputElem = document.getElementById(inputId);
            if (inputElem && user[userKey] !== undefined) {
                inputElem.value = user[userKey];
            }
        });

        // 綁定表單提交事件
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;

            if (!fullname || !email) {
                showMessage('Full name and email are required.', true);
                return;
            }

            const data = { fullname, email, phone };
            if (password) data.password = password;

            try {
                const updateResponse = await fetch(`../PJ/api/users.php?user_id=${encodeURIComponent(currentUser.user_id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!updateResponse.ok) {
                    const err = await updateResponse.json();
                    throw new Error(err.error || 'Failed to update profile');
                }

                showMessage('Profile updated successfully.', false);
                document.getElementById('password').value = ''; // 清空密碼欄
            } catch (err) {
                showMessage(err.message, true);
            }
        });

    } catch (error) {
        alert(error.message);
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    if (!fullname || !email) {
        showMessage('Full name and email are required.', true);
        return;
    }

    const data = { fullname, email, phone };
    if (password) {
        data.password = password;
    }

    try {
        const updateResponse = await fetch(`../PJ/api/staff.php?user_id=${encodeURIComponent(currentUser.user_id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) {
            const err = await updateResponse.json();
            throw new Error(err.error || 'Failed to update profile');
        }

        showMessage('Profile updated successfully.', false);
        document.getElementById('password').value = ''; // 清空密碼欄
    } catch (err) {
        showMessage(err.message, true);
    }
});


function showMessage(msg, isError) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        alert(msg);
        return;
    }
    messageDiv.textContent = msg;
    messageDiv.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
}

function logoutUser() {
    sessionStorage.removeItem('currentUser');
}
