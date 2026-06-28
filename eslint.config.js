import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Use recommended ESLint & TypeScript rules
  ...tseslint.configs.recommended,
  
  // Custom rules configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // MUST BE LAST: Turns off conflicting rules and integrates Prettier
  eslintPluginPrettierRecommended,
);
