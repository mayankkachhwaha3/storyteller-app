# Test info

- Name: check browser console for errors
- Location: /Users/mayankkachhwaha/CascadeProjects/storyteller/test/browser.test.ts:3:1

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/mayankkachhwaha/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
>  3 | test('check browser console for errors', async ({ page }) => {
     | ^ Error: browserType.launch: Executable doesn't exist at /Users/mayankkachhwaha/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   4 |   // Enable console messages capture
   5 |   page.on('console', msg => {
   6 |     console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
   7 |   });
   8 |
   9 |   // Go to the story generator page
  10 |   await page.goto('http://localhost:3002/generate');
  11 |   
  12 |   // Wait for page to load
  13 |   await page.waitForLoadState('networkidle');
  14 |   
  15 |   // Fill in the theme and generate story
  16 |   await page.fill('input[type="text"]', 'magical forest');
  17 |   await page.click('button:has-text("Generate Story")');
  18 |   
  19 |   // Wait for the story generation to complete
  20 |   await page.waitForTimeout(10000); // Adjust timeout as needed
  21 |   
  22 |   // Check for any console errors
  23 |   const errors = await page.evaluate(() => {
  24 |     return console.error.calls.map(call => call.args[0]);
  25 |   });
  26 |   
  27 |   expect(errors).toEqual([]);
  28 | });
  29 |
```