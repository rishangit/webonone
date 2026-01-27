# Linting Configuration

This project uses ESLint and Prettier for code quality and formatting.

## Configuration Files

- `.eslintrc.js` - ESLint configuration with TypeScript, React, and accessibility rules
- `.prettierrc` - Prettier configuration for code formatting
- `.prettierignore` - Files to ignore during Prettier formatting
- `.gitignore` - Files to ignore in Git

## Available Scripts

### Root Level (from project root)
```bash
# Lint all projects
npm run lint

# Lint and fix all projects
npm run lint:fix

# Format all files
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

### Frontend Only
```bash
cd front-end

# Lint frontend code
npm run lint

# Lint and fix frontend code
npm run lint:fix

# Format frontend code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

## ESLint Rules

### React Rules
- React hooks validation
- JSX best practices
- Component prop validation
- Accessibility checks

### TypeScript Rules
- Unused variables detection
- Type safety enforcement
- No explicit `any` types (warnings)
- Prefer const declarations

### General Rules
- Console warnings (not errors)
- No debugger statements
- No duplicate imports
- Prefer template literals
- Object shorthand notation

### Accessibility Rules
- Alt text for images
- Proper heading structure
- Keyboard navigation support
- ARIA attributes validation

## Prettier Configuration

- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, JSX
- **Line Width**: 80 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 compatible
- **Bracket Spacing**: Always add spaces
- **Arrow Parens**: Avoid when possible

## IDE Integration

### VS Code
Install these extensions for the best experience:
- ESLint
- Prettier - Code formatter
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer

### Settings
Add to your VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Pre-commit Hooks

The project is configured with Husky and lint-staged to automatically:
- Run ESLint on staged files
- Fix auto-fixable issues
- Format code with Prettier
- Prevent commits with linting errors

## Troubleshooting

### Common Issues

1. **ESLint errors in IDE but not in terminal**
   - Restart your IDE
   - Clear ESLint cache: `npx eslint --cache-location .eslintcache --cache`

2. **Prettier conflicts with ESLint**
   - Install `eslint-config-prettier` to disable conflicting rules
   - Ensure Prettier runs after ESLint

3. **TypeScript errors**
   - Run `npm run type-check` to see all TypeScript errors
   - Ensure all imports are properly typed

### Ignoring Rules

To ignore specific rules, use:
```javascript
// eslint-disable-next-line rule-name
```

For files, add to `.eslintrc.js`:
```javascript
ignorePatterns: [
  'path/to/file.js'
]
```

## Best Practices

1. **Run linting before commits**
2. **Fix auto-fixable issues immediately**
3. **Use meaningful variable names**
4. **Add proper TypeScript types**
5. **Follow accessibility guidelines**
6. **Keep functions small and focused**
7. **Use consistent naming conventions**
