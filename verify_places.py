from playwright.sync_api import Page, expect, sync_playwright

def verify_places_search(page: Page):
    # Navigate to the search page
    page.goto('http://localhost:3000/places/search')

    # Fill in the search query
    search_input = page.locator('input#search')
    search_input.fill('Gare de Lyon')

    # Click the search button
    page.locator('button[type="submit"]').click()

    # Wait for navigation to the results page and for the results to load
    page.wait_for_url('**/places/results?q=Gare%20de%20Lyon')
    expect(page.locator('h2.title:has-text("Résultats")')).to_be_visible()

    # Take a screenshot
    page.screenshot(path="verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_places_search(page)
        finally:
            browser.close()
