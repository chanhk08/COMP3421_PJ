/**
 * js/pages/index.js
 * 專門用於初始化 index.html 頁面（已重構）
 */

// 頁面載入時的總入口
document.addEventListener('DOMContentLoaded', () => {
    // 使用 navigator.js 模組中的函式來初始化導覽列
    initNavigator('nav-links');
    // 初始化商品列表（此部分邏輯保持不變）
    initProductList();
    
    initFooter('footer-container'); 
});

/**
 * 初始化商品列表
 */
function initProductList() {
    loadAllProducts(); // 來自 products.js
}
