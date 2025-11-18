/**
 * js/modules/footer.js
 * This module exports a function to dynamically inject the site footer.
 */

/**
 * Initializes and injects the footer into a specified container.
 * @param {string} containerId - The ID of the element where the footer should be placed.
 */
function initFooter(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Footer container with ID "${containerId}" not found.`);
        return;
    }

    // The entire footer HTML structure
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-section">
                    <h4>About Us</h4>
                    <p>Our Shop is dedicated to providing the best products with excellent customer service.</p>
                </div>
                <div class="footer-section">

                </div>
                <div class="footer-section">
                    <h4>Contact Us</h4>
                    <p>Email: <a href="mailto:25024246d@connect.polyu.hk">25024246d@connect.polyu.hk</a></p>
                    <p>Phone: (852) 1234-5678</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Pet Shop. All Rights Reserved.</p>
            </div>
        </footer>
    `;

    // Inject the HTML and CSS into the container
    container.innerHTML = footerHTML;
}
