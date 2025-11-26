exports.config = {
  tests: './tests/*.js',
  output: './output',
  helpers: {
    Playwright: {
      url: process.env.BASE_URL || 'http://localhost:5173',
      show: false,
      browser: 'chromium'
    }
  },
  include: {},

  mocha: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: './output',
      reportFilename: 'report',
      reportTitle: 'E2E Test Report'
    }
  },
  name: 'e2e'
}


