module.exports = {
  setupFilesAfterEnv: ['./jest-setup.ts'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['./src/**/*!(.test).ts'],
  timers: 'fake',
};
