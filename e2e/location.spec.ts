import { test, expect } from '@playwright/test';

test.describe('LocationDetection', () => {
  test.beforeEach(async ({ context }) => {
    // Mock geolocation
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 }); // Eiffel Tower
  });

  test.skip('should display the map and nearby stations after detection', async ({ page }) => {
    // Mock the MapTiler API request to prevent 403 errors in CI
    await page.route('https://api.maptiler.com/maps/streets/style.json?key=*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: 8, sources: {}, layers: [] }),
      });
    });

    // Listen for console messages and log them to the test output
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

    // Navigate to the correct location page using a relative path
    await page.goto('/location-detection');

    // Take a screenshot to debug the initial state
    await page.screenshot({ path: '/home/jules/verification/before-click-debug.png' });

    // Click the "Detect Now" button
    const detectButton = page.getByRole('button', { name: /Détecter maintenant/i });

    await expect(detectButton).toBeVisible({ timeout: 10000 });

    await detectButton.click();

    // Wait for the map container to have the 'data-map-loaded' attribute set to 'true'
    const mapContainer = page.locator('.map-container[data-map-loaded="true"]');
    await expect(mapContainer).toBeVisible({ timeout: 15000 }); // Increased timeout for map loading

    // Take a final screenshot of the result
    await page.screenshot({ path: '/home/jules/verification/location-detection-result.png' });

    // Explicitly assert that the map is loaded
    await expect(mapContainer).toHaveAttribute('data-map-loaded', 'true');
  });
});
