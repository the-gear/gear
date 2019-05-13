const base = require('./jest.config.base.js');

let collectCoverage = false;
const reporters = base.reporters || ['default'];
if (process.env.CI === 'true' || process.argv.includes('--ci')) {
  collectCoverage = true;
  reporters.push([
    'jest-junit',
    {
      // https://github.com/jest-community/jest-junit#configuration
      outputDirectory: '<rootDir>/test-results/jest',
      outputName: 'results.xml',
      classNameTemplate: '{classname} {title}',
      suiteNameTemplate: '{title}',
      titleTemplate: '{classname} {title}',
      ancestorSeparator: ' → ',
      addFileAttribute: 'true', // this should be string
    },
  ]);
}

module.exports = {
  ...base,
  projects: ['<rootDir>/packages/*/jest.config.js'],
  collectCoverage,
  coverageDirectory: '<rootDir>/coverage/',
  reporters,
};
