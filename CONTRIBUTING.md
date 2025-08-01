# Contributing to Juvenotes

Thank you for considering contributing! Whether it’s code, docs, or feedback, your help is invaluable.

## Development Setup
1. **Fork** the repo and clone your fork.  
   ```bash
   git clone https://github.com/juvenotes/web.git
   ```
2. Ensure dependencies are installed:
   ```bash
   yarn install
3. Create a branch for your feature/fix:

    ``` bash
    git checkout -b feat/your-feature
    ```

## Workflow

- Backend: AdonisJS (TypeScript) routes/controllers in app/.

- Frontend: Vue.js components in resources/.

- Database: Add migrations in database/migrations.

## Pull Requests

- Test your changes locally.

- Ensure code follows our ESLint/Prettier rules.

- Reporting Bugs

- Open an issue with:

```
Description: Expected vs. actual behavior.

Steps to Reproduce: Clear, concise steps.

Environment: OS, Node.js version, etc.
```

## Code Style

TypeScript: Strict typing, AdonisJS conventions.

Vue: Composition API preferred.