from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3333/login")
    page.fill('input[name="email"]', "admin@test.com")
    page.fill('input[name="password"]', "password")
    page.click('button[type="submit"]')
    page.wait_for_url("http://localhost:3333/dashboard")
    page.goto("http://localhost:3333/events/test-event/quiz/1")
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()
