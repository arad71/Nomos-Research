const rules = {
  'max-len': ['error', 80, 2, { ignoreUrls: true }],
  'no-console': [0],
  'no-restricted-syntax': 'off',
  'no-continue': 'off',
  'no-underscore-dangle': 'off',
  'no-param-reassign': 'off',
  'prefer-destructuring': 'off',
  'import/extensions': 'off',
  'import/no-unresolved': 'off',
  'import/prefer-default-export': 'off',
  'operator-linebreak': 'off',
  'implicit-arrow-linebreak': 'off',
  'react/destructuring-assignment': 'off',
  'react/jsx-one-expression-per-line': 'off',
  'react/jsx-props-no-spreading': 'off',
  'lines-between-class-members': [
    'error',
    'always',
    { exceptAfterSingleLine: true },
  ],
};

module.exports = {
  extends: ['plugin:prettier/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  rules,
  env: {
    browser: true,
    commonjs: true,
    node: true,
    jest: true,
    es6: true,
  },
  plugins: ['react-hooks'],
  settings: {
    ecmascript: 6,
    jsx: true,
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    react: {
      pragma: 'React',
      version: '16.8',
    },
  },
};
