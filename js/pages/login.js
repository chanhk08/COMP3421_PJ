document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(e.target);
    const { username, password } = Object.fromEntries(formData.entries());
    try {
        const result = await loginUser(username, password);
        saveUserSession(result.user); // save login state
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login successful! Redirecting...';
        setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Login failed: ' + error.message;
    }
});