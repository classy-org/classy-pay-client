# classy-pay-client
Simple client for Classy Pay.

# installation

 $ npm install --save classy-pay-client

# usage

PayClient.request(appId, method, resource, postBody, callback)

```javascript
const PayClient = require('classy-pay-client')({
  apiUrl: 'https://pay.classy.org',
  timeout: 10000,
  token: 'YOUR_TOKEN'
  secret: 'YOUR_SECRET'
});

PayClient.get(0, '/transaction/1', (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result);
  }
});

```
