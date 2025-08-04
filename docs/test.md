# How to Run Tests

1. **Replace `.env.test` with your `.env` values:**
   - Copy the contents of your `.env` file and overwrite the values in `.env.test`.
   - Make sure all required variables match your actual environment.

2. **Run the test command:**
   - In your project root, run:
     ```bash
     node ace test
     ```

3. **Environment loading:**
   - The test runner sets `NODE_ENV=test` and loads environment variables from `.env.test`.
   - If you want to use your main `.env`, copy it to `.env.test` before running tests.

---

# Test Coverage

- Our tests are located in the `tests/` directory:
  - `unit/` for unit tests (e.g., utils, middleware, validators)
  - `functional/` for functional tests (e.g., auth, onboarding, settings)
  - `browser/` for browser-based tests