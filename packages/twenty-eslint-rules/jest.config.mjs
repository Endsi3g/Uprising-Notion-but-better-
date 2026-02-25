
export default {
  displayName: 'twenty-eslint-rules',
  silent: false,
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageDirectory: '../../coverage/packages/twenty-eslint-rules',
};
