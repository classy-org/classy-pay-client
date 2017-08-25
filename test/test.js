const PayClient = require('../index.js')({
  apiUrl: 'https://pay.classy.org',
  timeout: 10000,
  token: process.argv[2],
  secret: process.argv[3]
});

PayClient.request(
    process.argv[4], 'GET', '/transaction/1', {}, (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result);
  }
});
