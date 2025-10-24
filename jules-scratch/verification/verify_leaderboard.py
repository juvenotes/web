from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set a mobile viewport to test responsiveness
    page.set_viewport_size({"width": 375, "height": 667})

    # Navigate to a placeholder leaderboard URL
    page.goto("http://127.0.0.1:3333/manage/events/test-event/quiz/1/leaderboard")

    # Take a screenshot to verify the layout
    page.screenshot(path="jules-scratch/verification/leaderboard_screenshot.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
