/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  reporters: [
    ['jest-html-reporter', {
      pageTitle: 'Backend Test Report',
      outputPath: 'test-report.html',
    }],
    ['jest-junit', {
      outputDirectory: '.',
      outputName: 'junit.xml',
    }]
  ],
};
