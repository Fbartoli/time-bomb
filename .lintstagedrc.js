module.exports = {
  // Run ESLint on all staged files
  "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
  // Run type checking on all staged files
  "**/*.{ts,tsx}": () => "tsc --noEmit"
} 