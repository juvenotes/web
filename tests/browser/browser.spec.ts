import { test } from '@japa/runner'

test('can visit home page', async ({ visit }) => {
  const page = await visit('/')

  // Use supported assertions from the documentation
  // Verify that the page has loaded by checking for body element
  await page.assertExists('body')

  // Verify we're on the expected path
  await page.assertPath('/')

  console.log('Home page loaded successfully')
})
