# Browser Extensions

A collection of browser extensions for GitHub PR management.

## Development Setup

### Node.js Version Management

This project uses **nvm** (Node Version Manager) for Node.js version management, similar to how Poetry manages Python environments.

#### Prerequisites

- Install [nvm](https://github.com/nvm-sh/nvm) if you haven't already

#### Setup Development Environment

1. **Switch to the required Node.js version:**

   ```bash
   nvm use
   ```

   This automatically uses the version specified in `.nvmrc` (22.20.0).

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run tests:**

   ```bash
   npm test
   ```

4. **Run linting:**

   ```bash
   npm run lint
   ```

5. **Format code:**
   ```bash
   npm run fmt
   ```

### Environment Management

- **Node.js Version**: Specified in `.nvmrc` (22.20.0)
- **npm Version**: Minimum 10.0.0 (specified in `package.json` engines field)
- **Dependencies**: Managed via `package.json` and `package-lock.json`
- **Isolation**: Each project has its own `node_modules` directory

### Available Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint JavaScript and HTML files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run fmt` - Format code with Prettier
- `npm run fmt:check` - Check code formatting

### Project Structure

```
browser-extensions/
├── .nvmrc                 # Node.js version specification
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── jest.setup.js          # Jest test configuration
└── github_pr_merge_method/
    ├── content.js         # Main extension logic
    ├── content.test.js    # Unit tests
    └── popup.js           # Extension popup
```
