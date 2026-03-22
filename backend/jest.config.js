module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  testPathIgnorePatterns: ['jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};