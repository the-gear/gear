const { defaults } = require('jest-config');

module.exports = (package, { tsConfig } = {}) => {
  const name = package.name;
  const displayName = name.replace(/^@the-gear\//, '');

  return {
    name,
    displayName,

    // preset: 'ts-jest',

    testEnvironment: 'node',
    roots: ['<rootDir>'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
      // '^.+\\.(gql|graphql)s?$': '???',
    },
    testRegex: '(/__tests__/.*\\.(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['(__tests__/.*.mock).(jsx?|tsx?)$'],
    verbose: true,
    globals: {
      'ts-jest': {
        tsConfig: tsConfig || '<rootDir>/src/__tests__/tsconfig.json',
        diagnostics: {
          warnOnly: true,
        },
      },
    },
  };
};
