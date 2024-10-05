module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["plugin:@typescript-eslint/strict", "prettier"],
  parserOptions: {
    project: "tsconfig.json",
  },
};
