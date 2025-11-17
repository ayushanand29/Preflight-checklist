module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/src/_test_/styleMock.js",
  },

  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
