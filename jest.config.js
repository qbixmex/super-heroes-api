/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupFilesAfterEnv.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testMatch: [
    '<rootDir>/**/__tests__/**/?(*.)(spec|test).js',
    '<rootDir>/**/?(*.)(spec|test).js',
  ],
};