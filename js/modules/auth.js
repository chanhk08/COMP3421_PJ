/**
 * 
 * @param {object} userData
 * @returns {Promise<any>}
 */
async function registerUser(userData) {
    return await apiRequest('users.php', 'POST', userData);
}

/**
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<any>}
 */
async function loginUser(username, password) {
    return await apiRequest('login.php', 'POST', { username, password });
}

/**
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<any>}
 */
async function loginUserStaff(username, password) {
    return await apiRequest('login_staff.php', 'POST', { username, password });
}

/**
 * @param {number} userId 
 * @returns {Promise<any>}
 */
async function getUserProfile(userId) {
    return await apiRequest('users.php', 'GET', { user_id: userId });
}

/**
 * @param {number} userId 
 * @param {object} profileData
 * @returns {Promise<any>}
 */
async function updateUserProfile(userId, profileData) {
    return await apiRequest(`users.php?user_id=${userId}`, 'PUT', profileData);
}

/**
 * @param {object} user
 */
function saveUserSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * @returns {object|null}
 */
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
