/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = config;
