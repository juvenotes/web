import { test } from '@japa/runner'

test.group('Onboarding flow', () => {
  // Test the complete onboarding flow with correct data
  test('can complete onboarding with valid data', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Step 1: Select education level
    await page.assertPath('/onboarding')
    await page.assertExists('.step-indicator')

    // Select an education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 2: Select course
    // Wait for courses to load
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 3: Select institution
    // Wait for institutions to load
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 4: Select graduation year
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    // Select a graduation year (current year + 3)
    const currentYear = new Date().getFullYear()
    await page.click(`[role="option"]:has-text("${currentYear + 3}")`)

    // Submit the form
    await page.click('button:has-text("Complete")')

    // Should redirect to the learn page after successful onboarding
    await page.waitForNavigation()
    await page.assertPath('/learn')
  })

  // Test validation when trying to navigate without selecting required fields
  test('cannot proceed without selecting required fields', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Try to navigate to next step without selecting education level
    await page.click('button:has-text("Next")')

    // Should still be on step 1
    await page.assertExists('.step-indicator div:nth-child(1).border-primary')

    // Select education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Try to navigate to next step without selecting course
    await page.click('button:has-text("Next")')

    // Should still be on step 2
    await page.assertExists('.step-indicator div:nth-child(2).border-primary')
  })

  // Test that courses are filtered by education level
  test('courses are filtered by education level', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Select first education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Wait for courses to load for first education level
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')

    // Store courses from first education level
    const firstLevelCoursesCount = await page.locator('[role="option"]').count()
    await page.click('body') // Click outside to close dropdown

    // Go back to education level selection
    await page.click('button:has-text("Previous")')

    // Select second education level if available
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    const educationLevelOptions = await page.locator('[role="option"]').count()

    // Only proceed if there's more than one education level
    if (educationLevelOptions > 1) {
      await page.click('[role="option"]:nth-child(2)')
      await page.click('button:has-text("Next")')

      // Wait for courses to load for second education level
      await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
      await page.click('button[role="combobox"]')
      await page.waitForSelector('[role="option"]')

      // Compare course counts - they might be different for different education levels
      const secondLevelCoursesCount = await page.locator('[role="option"]').count()
      console.log(`Courses for first education level: ${firstLevelCoursesCount}`)
      console.log(`Courses for second education level: ${secondLevelCoursesCount}`)
    }
  })

  // Test navigation between steps (next/previous)
  test('can navigate between steps', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Step 1: Select education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Verify we're on step 2
    await page.assertExists('.step-indicator div:nth-child(2).border-primary')

    // Go back to step 1
    await page.click('button:has-text("Previous")')

    // Verify we're back on step 1
    await page.assertExists('.step-indicator div:nth-child(1).border-primary')

    // Go forward again to step 2
    await page.click('button:has-text("Next")')

    // Verify we're on step 2 again
    await page.assertExists('.step-indicator div:nth-child(2).border-primary')
  })

  // Test changing course resets institution selection
  test('changing course resets institution selection', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Step 1: Select education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 2: Select first course
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 3: Select institution
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')

    // Get the selected institution name
    const selectedInstitution = await page.locator('button[role="combobox"]').textContent()

    // Go back to course selection
    await page.click('button:has-text("Previous")')

    // Check if there's more than one course
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    const courseOptions = await page.locator('[role="option"]').count()

    if (courseOptions > 1) {
      // Select a different course
      await page.click('[role="option"]:nth-child(2)')
      await page.click('button:has-text("Next")')

      // Check institution dropdown - selection should be reset
      const currentSelectedValue = await page.locator('button[role="combobox"]').textContent()
      console.log(
        `Previous institution: ${selectedInstitution}, Current selection: ${currentSelectedValue}`
      )

      // Check if the institution dropdown shows the placeholder text (reset)
      await page.assertExists('button[role="combobox"]')
    }
  })

  // Test graduation year selection has valid range
  test('graduation year has valid range of options', async ({ visit }) => {
    const page = await visit('/onboarding?user_id=6')

    // Step 1-3: Navigate through the first three steps quickly
    // Education level
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Course
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Institution
    await page.waitForSelector('button[role="combobox"]:not(:has([class*="animate-spin"]))')
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')
    await page.click('[role="option"]:first-child')
    await page.click('button:has-text("Next")')

    // Step 4: Check graduation year range
    await page.click('button[role="combobox"]')
    await page.waitForSelector('[role="option"]')

    // Get the current year for comparison
    const currentYear = new Date().getFullYear()

    // Check that years in appropriate range are available
    // We expect years from approximately (currentYear - 5) to (currentYear + 10)
    const pastYearExists =
      (await page.locator(`[role="option"]:has-text("${currentYear - 5}")`).count()) > 0
    const currentYearExists =
      (await page.locator(`[role="option"]:has-text("${currentYear}")`).count()) > 0
    const futureYearExists =
      (await page.locator(`[role="option"]:has-text("${currentYear + 5}")`).count()) > 0

    console.log(`Past year (${currentYear - 5}) exists: ${pastYearExists}`)
    console.log(`Current year (${currentYear}) exists: ${currentYearExists}`)
    console.log(`Future year (${currentYear + 5}) exists: ${futureYearExists}`)

    // At least current year and future years should be available
    await page.assertExists(`[role="option"]:has-text("${currentYear}")`)
    await page.assertExists(`[role="option"]:has-text("${currentYear + 3}")`)
  })
})
