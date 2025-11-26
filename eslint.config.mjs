import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import unusedImports from "eslint-plugin-unused-imports";
import angular from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';

export default [
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular,
      '@typescript-eslint': tsEslintPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'kmgp',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'kmgp',
          style: 'kebab-case',
        },
      ],
      "@angular-eslint/component-class-suffix": [
        "error",
        {
          "suffixes": ["Component"]
        }
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          "allowExpressions": true,
          "allowTypedFunctionExpressions": true,
          "allowHigherOrderFunctions": true,
          "allowDirectConstAssertionInArrowFunctions": true,
          "allowConciseArrowFunctionExpressionsStartingWithVoid": true
        }
      ],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "spaced-comment": ["error", "never"],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    languageOptions: {
      parser: angularTemplateParser,
    },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules,
      "@typescript-eslint/ban-ts-comment": "off",
      // Также можно отключить другие потенциально проблемные TS-правила здесь
      // "@typescript-eslint/indent": "off",
      // "@typescript-eslint/no-unused-vars": "off"
    }
  },
];
