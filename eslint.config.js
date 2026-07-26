// ブラウザで直接読み込むvanilla JS用のESLint設定（モジュールを使わないためsourceTypeは"script"）
module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        setInterval: 'writable',
        clearInterval: 'writable',
        setTimeout: 'writable',
        clearTimeout: 'writable',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-redeclare': 'error',
      'no-undef': 'error',
    },
  },
  {
    // home.js/simulation.js は calorie-calc.js が先に読み込まれる前提で
    // calculateCalories/calculateWeightLoss を使う（HTML側のscript読み込み順に依存）
    files: ['home.js', 'simulation.js'],
    languageOptions: {
      globals: {
        calculateCalories: 'readonly',
        calculateWeightLoss: 'readonly',
      },
    },
  },
  {
    // profile.js/timer.js は header.js が先に読み込まれる前提で showToast を使う
    files: ['profile.js', 'timer.js'],
    languageOptions: {
      globals: {
        showToast: 'readonly',
      },
    },
  },
  {
    // Service Worker実行環境のグローバル（windowやdocumentは存在しない）
    files: ['service-worker.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
      },
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
      },
    },
  },
];
