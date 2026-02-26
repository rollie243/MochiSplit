import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

const SCREENSHOTS_DIR = '/Users/rolandtey/.gemini/antigravity/brain/18542b91-5465-4eb9-86f3-44474bc49224';

async function run() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 800, deviceScaleFactor: 2 });

    // STEP 1: Landing
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await setTimeout(1200);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step1_landing.png`, fullPage: false });
    console.log('✅ Step 1: Landing page');

    // STEP 2: Click "Enter items manually"
    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Enter items manually'));
        if (btn) btn.click();
    });
    await setTimeout(800);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step2_editor.png`, fullPage: false });
    console.log('✅ Step 2: Items editor (empty)');

    // STEP 3: Add items using placeholder-based selectors
    const items = [
        { name: 'Nasi Goreng', price: '12.50' },
        { name: 'Iced Latte', price: '6.90' },
        { name: 'Tom Yum Soup', price: '18.00' },
    ];

    for (const item of items) {
        // Clear and type into the Item name input
        const nameInput = await page.$('input[placeholder="Item name"]');
        if (nameInput) {
            await nameInput.click({ clickCount: 3 });
            await nameInput.press('Backspace');
            await nameInput.type(item.name, { delay: 30 });
        }
        // Clear and type into the price input
        const priceInput = await page.$('input[placeholder="0.00"]');
        if (priceInput) {
            await priceInput.click({ clickCount: 3 });
            await priceInput.press('Backspace');
            await priceInput.type(item.price, { delay: 30 });
        }
        // Click the round + button (w-12 h-12 rounded-full bg-dark)
        await page.evaluate(() => {
            const svgs = document.querySelectorAll('svg');
            for (const svg of svgs) {
                const btn = svg.closest('button');
                if (btn && btn.className.includes('rounded-full') && btn.className.includes('bg-dark') && btn.className.includes('w-12')) {
                    btn.click();
                    return;
                }
            }
        });
        await setTimeout(600);
    }

    await setTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step3_items.png`, fullPage: true });
    console.log('✅ Step 3: Items added');

    // STEP 4: Click "Add Friends"
    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Add Friends'));
        if (btn) btn.click();
    });
    await setTimeout(800);

    // Add friends
    const friends = ['Alice', 'Bob', 'Carol'];
    for (const name of friends) {
        const input = await page.$('input[placeholder="Friend\'s name..."]');
        if (input) {
            await input.click({ clickCount: 3 });
            await input.press('Backspace');
            await input.type(name, { delay: 30 });
        }
        // Click the Add button
        await page.evaluate(() => {
            const btns = [...document.querySelectorAll('button')];
            const btn = btns.find(b => b.textContent.trim() === 'Add');
            if (btn) btn.click();
        });
        await setTimeout(500);
    }

    await setTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step4_friends.png`, fullPage: false });
    console.log('✅ Step 4: Friends added');

    // STEP 5: Click "Start Assigning"
    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Start Assigning'));
        if (btn) btn.click();
    });
    await setTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step5_assign_start.png`, fullPage: true });
    console.log('✅ Step 5: Assignment page');

    // STEP 6: Assign items to friends
    async function clickItemCard(itemName) {
        await page.evaluate((name) => {
            // Find all card-like divs that contain the item name
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
                if (div.className && div.className.includes('card') &&
                    div.className.includes('cursor-pointer') &&
                    div.textContent.includes(name)) {
                    div.click();
                    return true;
                }
            }
            return false;
        }, itemName);
        await setTimeout(400);
    }

    async function selectFriend(friendName) {
        await page.evaluate((name) => {
            // Find friend avatar buttons
            const spans = document.querySelectorAll('span');
            for (const span of spans) {
                if (span.textContent.trim() === name) {
                    // Click the parent container to select this friend
                    const container = span.closest('div');
                    if (container) {
                        // Click the avatar (first child or the button)
                        const clickable = container.querySelector('button') || container;
                        clickable.click();
                        return true;
                    }
                }
            }
            return false;
        }, friendName);
        await setTimeout(300);
    }

    // Alice is selected first by default
    await clickItemCard('Nasi Goreng');  // -> Alice
    await clickItemCard('Iced Latte');    // -> Alice

    // Select Bob
    await selectFriend('Bob');
    await clickItemCard('Iced Latte');    // -> Bob (split)
    await clickItemCard('Tom Yum Soup');  // -> Bob

    // Select Carol
    await selectFriend('Carol');
    await clickItemCard('Tom Yum Soup');  // -> Carol (split)

    await setTimeout(800);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step6_assigned.png`, fullPage: true });
    console.log('✅ Step 6: All items assigned');

    // STEP 7: Click "Time to Settle Up!"
    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Settle Up'));
        if (btn) btn.click();
    });
    await setTimeout(1200);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step7_settlement_top.png`, fullPage: false });
    console.log('✅ Step 7: Settlement (top)');

    // Scroll for more
    await page.evaluate(() => window.scrollTo(0, 500));
    await setTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step8_settlement_mid.png`, fullPage: false });
    console.log('✅ Step 8: Settlement (scrolled)');

    // Full page
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/step9_settlement_full.png`, fullPage: true });
    console.log('✅ Step 9: Settlement (full page)');

    await browser.close();
    console.log('\n🎉 All screenshots captured!');
}

run().catch(e => { console.error(e); process.exit(1); });
