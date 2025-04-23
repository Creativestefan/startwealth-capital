module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Set no-unused-vars to warning instead of error
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    // Set no-explicit-any to warning instead of error
    '@typescript-eslint/no-explicit-any': 'warn',
    // Disable unescaped entities rule to prevent quote issues
    'react/no-unescaped-entities': 'off',
    // Set missing dependencies to warning instead of error
    'react-hooks/exhaustive-deps': 'warn',
    // Set img element warning to warning instead of error
    '@next/next/no-img-element': 'warn'
  }
};
