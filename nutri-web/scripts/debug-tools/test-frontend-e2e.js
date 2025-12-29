import puppeteer from 'puppeteer';

(async () => {
    console.log('🚀 Starting Frontend E2E Test...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    try {
        const loginUrl = 'http://localhost:5000/login';
        console.log(`🌐 Navigating to ${loginUrl}...`);
        await page.goto(loginUrl, { waitUntil: 'networkidle0' });

        // Check if we are on the login page
        const title = await page.title();
        console.log(`📄 Page Title: ${title}`);

        // Selectors
        const emailSelector = 'input[name="email"]';
        const passwordSelector = 'input[name="password"]';
        const submitBtnSelector = 'button[type="submit"]';

        await page.waitForSelector(emailSelector);

        // Type Credentials
        console.log('🔑 Entering credentials...');
        await page.type(emailSelector, 'nutri.admin@sistema.com');
        await page.type(passwordSelector, 'nutri123');

        // Click Login
        console.log('🖱️ Clicking login...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for navigation
            page.click(submitBtnSelector),
        ]);

        // Verify Dashboard
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);

        if (currentUrl.includes('/dashboard')) {
            console.log('✅ LOGIN SUCCESS: Redirected to dashboard.');
        } else {
            console.error('❌ LOGIN FAILED: Did not redirect to dashboard.');
            console.error('Check if backend is running or credentials are correct.');
        }

        // Take screenshot
        await page.screenshot({ path: 'e2e-login-result.png' });
        console.log('📸 Screenshot saved to e2e-login-result.png');

    } catch (error) {
        console.error('❌ E2E TEST FAILED:', error);
    } finally {
        await browser.close();
        console.log('👋 Browser closed.');
    }
})();
