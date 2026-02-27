
export default {
  displayName: 'twenty-eslint-rules',
  preset: '../../scripts/jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageDirectory: '../../coverage/packages/twenty-eslint-rules',
};
