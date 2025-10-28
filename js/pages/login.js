document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(e.target);
    const { username, password } = Object.fromEntries(formData.entries());
    try {
        const result = await loginUser(username, password);
        saveUserSession(result.user); // 儲存登入狀態
        messageDiv.style.color = 'green';
        messageDiv.textContent = '登入成功！正在跳轉...';
        setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = '登入失敗: ' + error.message;
    }
});