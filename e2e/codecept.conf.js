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
  name: 'e2e'
}


