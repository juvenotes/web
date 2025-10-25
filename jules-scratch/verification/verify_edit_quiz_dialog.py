
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:3333/login")
    page.get_by_label("Email address").fill("superadmin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Navigate to event management
    page.goto("http://localhost:3333/manage/events")

    # Click on the first event
    page.get_by_role("link", name="View").first.click()

    # Click the "Edit" button for the first quiz
    page.get_by_role("button", name="Edit").first.click()

    # Wait for the dialog to appear
    expect(page.get_by_role("dialog", name="Edit Quiz")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/edit_quiz_dialog.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
