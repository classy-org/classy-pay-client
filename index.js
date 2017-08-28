'use strict';
const request = require('request');
const _ = require('lodash');
let apiUrl;
let token;
let secret;
let timeout;
let HmacAuthorize;
let errorNok;

function payRequest(appId, method, resource, payload, callback) {
  let options = {
    url: `${apiUrl}${resource}?appId=${appId}&meta=true`,
    timeout: timeout,
    method,
    headers: {
      'Authorization': HmacAuthorize.sign(method, resource, 'application/json',
        payload ? JSON.stringify(payload) : null),
      'User-Agent': 'ClassyPay Node.JS'
    }
  };
  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }
  request(options, function(error, response, body) {
    let errorResponse = {
      status: _.get(response, 'statusCode'),
      error: error || response
    };
    if (_.get(response, 'statusCode') === 200) {
      callback(null, body ? JSON.parse(body) : {});
    } else if (errorNok) {
      callback(errorResponse);
    } else {
      callback(null, errorResponse);
    }
  });
}

module.exports = (config) => {
  if (!config || !config.apiUrl || !config.timeout ||
    !config.token || !config.secret) {
    throw new Error('You must provide apiUrl, timeout, token, and secret.');
  }
  apiUrl = config.apiUrl;
  token = config.token;
  secret = config.secret;
  timeout = config.timeout;
  errorNok = config.errorNok || true,
  HmacAuthorize = require('authorization-hmac256')({
    service: 'CWS',
    token,
    secret
  });
  return {
    request: payRequest
  };
};
