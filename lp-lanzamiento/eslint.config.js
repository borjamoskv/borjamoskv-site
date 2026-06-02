import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          "selector": "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          "message": "Non-deterministic rendering breaks hydration stability"
        },
        {
          "selector": "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          "message": "Use injected timestamp or client-only lifecycle for Date.now()"
        },
        {
          "selector": "NewExpression[callee.name='Date']",
          "message": "Use injected timestamp or client-only lifecycle for new Date()"
        }
      ]
    }
  }
];
