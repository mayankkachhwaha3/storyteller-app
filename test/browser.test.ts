import { test, expect } from '@playwright/test';

test('check browser console for errors', async ({ page }) => {
  // Enable console messages capture
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });

  // Go to the story generator page
  await page.goto('http://localhost:3002/generate');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Fill in the theme and generate story
  await page.fill('input[type="text"]', 'magical forest');
  await page.click('button:has-text("Generate Story")');
  
  // Wait for the story generation to complete
  await page.waitForTimeout(10000); // Adjust timeout as needed
  
  // Check for any console errors
  const errors = await page.evaluate(() => {
    return console.error.calls.map(call => call.args[0]);
  });
  
  expect(errors).toEqual([]);
});
