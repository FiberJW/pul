module.exports = {
  extends: [
    'chalkdust',
    'plugin:jsx-control-statements/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],
  plugins: ['jsx-control-statements'],
  rules: {
    'react/sort-comp': [
      1,
      {
        order: [
          'static-methods',
          'everything-else',
          '/^on.+$/',
          'lifecycle',
          'render',
        ],
      },
    ],
  },
};
