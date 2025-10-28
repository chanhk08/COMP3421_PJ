document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    try {
        const result = await registerUser(userData);
        messageDiv.style.color = 'green';
        messageDiv.textContent = result.message + ' 正在跳轉至登入頁面...';
        setTimeout(() => window.location.href = 'login.html', 2000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = '註冊失敗: ' + error.message;
    }
});