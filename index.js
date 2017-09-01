'use strict';
const httpRequest = require('request');
const _ = require('lodash');
let HmacAuthorize;
let config;

function parse(body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    console.error(e);
    return {};
  }
}

function request(appId, method, resource, payload, callback) {
  let options = {
    url: `${config.apiUrl}${resource}?appId=${appId}&meta=true`,
    timeout: config.timeout,
    method,
    agent: config.agent,
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
  httpRequest(options, function(error, response, body) {
    callback(error, {
      status: _.get(response, 'statusCode'),
      error,
      response,
      body,
      object: parse(body)
    });
  });
}

function forObject(appId, method, resource, body, callback) {
  request(appId, method, resource, body, function(error, result) {
    if (_.get(result, 'status') !== 200) {
      callback(error || `${result.status}: ${resource} ${result.body}`);
    } else {
      callback(null, result.object);
    }
  });
}

function get(appId, resource, callback) {
  return forObject(appId, 'GET', resource, null, callback);
}

function post(appId, resource, object, callback) {
  return forObject(appId, 'POST', resource, object, callback);
}

function put(appId, resource, object, callback) {
  return forObject(appId, 'PUT', resource, object, callback);
}

function del(appId, resource, callback) {
  return forObject(appId, 'DELETE', resource, null, callback);
}

module.exports = (callerConfig) => {
  config = callerConfig;
  if (!config || !config.apiUrl || !config.token || !config.secret) {
    throw new Error('You must provide apiUrl, token, and secret.');
  }
  HmacAuthorize = require('authorization-hmac256')({
    service: 'CWS',
    token: config.token,
    secret: config.secret
  });
  return {
    request,
    get,
    post,
    put,
    del
  };
};
