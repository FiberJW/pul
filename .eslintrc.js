module.exports = {
  extends: [
    "chalkdust",
    "plugin:jsx-control-statements/recommended",
    "prettier",
    "prettier/flowtype",
    "prettier/react"
  ],
  plugins: ["jsx-control-statements", "react", "react-native"],
  rules: {
    "react/prop-types": 1,
    "react-native/no-unused-styles": 1,
    "consistent-return": 0,
    "react/sort-comp": [
      1,
      {
        order: [
          "static-methods",
          "everything-else",
          "/^on.+$/",
          "lifecycle",
          "render"
        ]
      }
    ]
  }
};
