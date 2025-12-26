const { chromium } = require('playwright');
const path = require('path');

/**
 * TikTok Profile Automation Module
 * Uses Playwright to automate TikTok profile editing
 */

class TikTokAutomation {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    /**
     * Initialize browser with cookies
     * @param {Array} cookies - TikTok session cookies
     */
    async init(cookies) {
        try {
            console.log('🚀 Launching browser...');

            // Launch browser with stealth settings
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            // Create context with cookies
            this.context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York'
            });

            // Add cookies to context
            if (cookies && cookies.length > 0) {
                await this.context.addCookies(cookies);
                console.log('🍪 Cookies added successfully');
            }

            // Create new page
            this.page = await this.context.newPage();

            // Add extra headers to look more like a real browser
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            });

            console.log('✅ Browser initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing browser:', error.message);
            await this.cleanup();
            throw error;
        }
    }

    /**
     * Navigate to TikTok profile edit page
     */
    async navigateToEditProfile() {
        try {
            console.log('🔍 Navigating to profile edit page...');

            // First try to go to main TikTok page
            console.log('📍 Step 1: Loading TikTok homepage...');
            await this.page.goto('https://www.tiktok.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            // Wait a bit for cookies to be processed
            await this.page.waitForTimeout(3000);

            // Check if we're logged in
            console.log('📍 Step 2: Checking login status...');
            const isLoggedIn = await this.page.evaluate(() => {
                return document.cookie.includes('sessionid');
            });

            if (!isLoggedIn) {
                console.error('❌ Not logged in - cookies may be invalid');
                throw new Error('الـ cookies غير صالحة أو منتهية الصلاحية');
            }

            console.log('✅ Login verified, navigating to settings...');

            // Now go to settings page
            console.log('📍 Step 3: Loading settings page...');
            await this.page.goto('https://www.tiktok.com/setting', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            // Wait for page to load
            await this.page.waitForTimeout(3000);

            console.log('✅ Successfully navigated to edit page');
            return true;
        } catch (error) {
            console.error('❌ Error navigating:', error.message);

            // Take screenshot for debugging
            try {
                const screenshotPath = path.join(__dirname, 'debug-error.png');
                await this.page.screenshot({ path: screenshotPath });
                console.log('📸 Screenshot saved to:', screenshotPath);
            } catch (e) {
                // Ignore screenshot errors
            }

            throw error;
        }
    }

    /**
     * Update profile nickname
     * @param {string} newNickname - New nickname to set
     */
    async updateNickname(newNickname) {
        try {
            console.log('📝 Updating nickname to:', newNickname);

            // Navigate to edit profile if not already there
            await this.navigateToEditProfile();

            // Find and click on the nickname/name field
            const nameInput = this.page.locator('input[placeholder*="Name"], input[name="nickname"], input[type="text"]').first();
            await nameInput.waitFor({ timeout: 10000 });

            // Clear existing text and type new nickname
            await nameInput.click({ clickCount: 3 }); // Select all
            await nameInput.fill(newNickname);

            // Wait a bit for changes to register
            await this.page.waitForTimeout(1000);

            // Find and click save button
            const saveButton = this.page.locator('button:has-text("Save"), button[type="submit"]').first();
            await saveButton.click();

            // Wait for save to complete
            await this.page.waitForTimeout(2000);

            console.log('✅ Nickname updated successfully');
            return { success: true, message: 'تم تحديث الاسم بنجاح' };
        } catch (error) {
            console.error('❌ Error updating nickname:', error.message);
            return { success: false, message: 'فشل تحديث الاسم: ' + error.message };
        }
    }

    /**
     * Update profile bio
     * @param {string} newBio - New bio to set
     */
    async updateBio(newBio) {
        try {
            console.log('📄 Updating bio to:', newBio);

            // Navigate to edit profile if not already there
            await this.navigateToEditProfile();

            // Find and click on the bio field
            const bioInput = this.page.locator('textarea[placeholder*="Bio"], textarea[name="bio"]').first();
            await bioInput.waitFor({ timeout: 10000 });

            // Clear existing text and type new bio
            await bioInput.click({ clickCount: 3 }); // Select all
            await bioInput.fill(newBio);

            // Wait a bit for changes to register
            await this.page.waitForTimeout(1000);

            // Find and click save button
            const saveButton = this.page.locator('button:has-text("Save"), button[type="submit"]').first();
            await saveButton.click();

            // Wait for save to complete
            await this.page.waitForTimeout(2000);

            console.log('✅ Bio updated successfully');
            return { success: true, message: 'تم تحديث البايو بنجاح' };
        } catch (error) {
            console.error('❌ Error updating bio:', error.message);
            return { success: false, message: 'فشل تحديث البايو: ' + error.message };
        }
    }

    /**
     * Update profile avatar
     * @param {string} avatarPath - Path to avatar image file
     */
    async updateAvatar(avatarPath) {
        try {
            console.log('🖼️ Updating avatar from:', avatarPath);

            // Navigate to edit profile if not already there
            await this.navigateToEditProfile();

            // Find and click on the avatar upload button
            const uploadButton = this.page.locator('input[type="file"][accept*="image"]').first();
            await uploadButton.waitFor({ timeout: 10000 });

            // Upload the file
            await uploadButton.setInputFiles(avatarPath);

            // Wait for upload to complete
            await this.page.waitForTimeout(3000);

            // Find and click save/apply button if exists
            const applyButton = this.page.locator('button:has-text("Apply"), button:has-text("Save")').first();
            if (await applyButton.count() > 0) {
                await applyButton.click();
                await this.page.waitForTimeout(2000);
            }

            console.log('✅ Avatar updated successfully');
            return { success: true, message: 'تم تحديث الصورة بنجاح' };
        } catch (error) {
            console.error('❌ Error updating avatar:', error.message);
            return { success: false, message: 'فشل تحديث الصورة: ' + error.message };
        }
    }

    /**
     * Take a screenshot for debugging
     */
    async screenshot(filename = 'debug.png') {
        if (this.page) {
            await this.page.screenshot({ path: filename, fullPage: true });
            console.log('📸 Screenshot saved:', filename);
        }
    }

    /**
     * Cleanup browser resources
     */
    async cleanup() {
        try {
            if (this.page) await this.page.close();
            if (this.context) await this.context.close();
            if (this.browser) await this.browser.close();
            console.log('🧹 Browser cleaned up');
        } catch (error) {
            console.error('Error during cleanup:', error.message);
        }
    }
}

/**
 * Helper function to parse cookies from string format
 * @param {string} cookieString - Cookie string from browser
 * @returns {Array} Array of cookie objects
 */
function parseCookies(cookieString) {
    if (!cookieString) return [];

    const cookies = [];
    const pairs = cookieString.split(';');

    for (const pair of pairs) {
        const [name, value] = pair.trim().split('=');
        if (name && value) {
            cookies.push({
                name: name.trim(),
                value: value.trim(),
                domain: '.tiktok.com',
                path: '/'
            });
        }
    }

    return cookies;
}

module.exports = { TikTokAutomation, parseCookies };
