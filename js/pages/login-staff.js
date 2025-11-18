document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(e.target);
    const { username, password } = Object.fromEntries(formData.entries());
    try {
        const result = await loginUserStaff(username, password);
        saveUserSession(result.user); // save login state in session/local storage
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login successful! Redirecting...';
        console.log(sessionStorage.getItem('currentUser'));
        setTimeout(() => window.location.href = 'staff_home.html', 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Login failed: ' + error.message;
    }
});