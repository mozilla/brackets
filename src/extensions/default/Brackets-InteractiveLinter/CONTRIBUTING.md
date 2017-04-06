# The Basics

### Filing a bug

**For bugs** be sure to search existing issues first. Include steps to consistently reproduce the
problem, actual vs. expected results, and your OS and Brackets version number.

When filing a new bug, please include:

- Descriptive title
- Steps to reproduce the problem
- Describe current and expected behavior
- Include the exact text of any error messages if applicable (or upload screenshots)
- Brackets version (or if you're pulling directly from Git, your current commit SHA - use git rev-parse HEAD)
- Interactive Linter Version (see Extension Manager)
- OS, and OS version
- List of other installed extensions
- Any errors logged in Debug > Show Developer Tools - Console view

### Guidelines for code contributions

#### LoDash vs. Native Policy

- Use native methods when available
- Use LoDash for iteration of everything but arrays
- Use LoDash utility methods when the native alternative increases complexity and syntax verbosity

#### Code Style
- Use 4 spaces
- Format if/else, try/catch/finally, etc. block as follows. Note the line break before the `else` keyword.

```javascript
if (condition) {
    // ...
}
else {

}
```
