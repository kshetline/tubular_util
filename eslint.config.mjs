import chaiFriendly from 'eslint-plugin-chai-friendly';
import stylistic from '@stylistic/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    plugins: {
      '@stylistic': stylistic,
      'chai-friendly': chaiFriendly,
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/ban-ts-comment': 'off',
      'brace-style': [
        'error',
        'stroustrup',
        {
          'allowSingleLine': true
        }
      ],
      'camelcase': 'off',
      'comma-dangle': [
        'error',
        {
          'arrays': 'only-multiline',
          'objects': 'only-multiline',
          'imports': 'only-multiline',
          'exports': 'only-multiline',
          'functions': 'never'
        }
      ],
      'curly': 'off',
      'indent': 'off',
      '@stylistic/indent': [
        'error',
        2,
        {
          'ArrayExpression': 'first',
          'CallExpression': { 'arguments': 'off' },
          'FunctionDeclaration': { 'parameters': 'off' },
          'FunctionExpression': { 'parameters': 'off' },
          'ignoreComments': true,
          'ignoredNodes': [
            'ClassProperty[value]',
            'TSTypeAnnotation > TSFunctionType',
            'NewExpression[arguments] :expression *'
          ],
          'ObjectExpression': 'first',
          'SwitchCase': 1
        }
      ],
      'key-spacing': 'off',
      'multiline-ternary': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      'no-control-regex': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-labels': 'off',
      'no-mixed-operators': 'off',
      'no-multi-spaces': 'off',
      'no-new': 'off',
      'no-return-assign': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-unused-expressions': 'off',
      'no-useless-constructor': 'off',
      '@/no-useless-constructor': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'after-used',
          'argsIgnorePattern': '^_',
          'ignoreRestSiblings': false,
          'vars': 'all'
        }
      ],
      'one-var': 'off',
      'operator-linebreak': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'semi': [
        'error',
        'always'
      ],
      'space-before-function-paren': [
        'error',
        {
          'anonymous': 'always',
          'named': 'never',
          'asyncArrow': 'always'
        }
      ],
      'quotes': [
        'error',
        'single',
        {
          'allowTemplateLiterals': true,
          'avoidEscape': true
        }
      ],
      'yoda': [
        'error',
        'never',
        {
          'exceptRange': true
        }
      ]
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.eslint.json'
      }
    }
  }
];
