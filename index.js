const req = require('requestretry');
const _ = require('lodash');
const Promise = require('bluebird');
let HmacAuthorize;
let config;

function getHeaders(method, resource, payload) {
  return {
    'Authorization': HmacAuthorize.sign(method, resource, 'application/json',
      payload ? JSON.stringify(payload) : null),
    'User-Agent': 'ClassyPay Node.JS'
  };
}

function getQs(appId, pagination) {
  return {
    appId,
    meta: true,
    limit: pagination ? pagination.limit : undefined,
    offset: pagination ? pagination.offset : undefined
  };
}

function getOptions(appId, method, resource, payload, pagination) {
  return {
    method,
    url: `${config.apiUrl}${resource}`,
    qs: getQs(appId, pagination),
    json: payload !== null,
    body: payload,
    timeout: config.timeout,
    headers: getHeaders(method, resource, payload)
  };
}

function getResult(error, response, body) {
  return {
    status: _.get(response, 'statusCode'),
    error,
    response,
    body,
    object: (body &&
        response.headers['content-type'].includes('application/json')) ?
      JSON.parse(body) : body
  };
}

function request(appId, method, resource, payload, pagination, callback) {
  let options = getOptions(appId, method, resource, payload, pagination);
  req(options, function(error, response, body) {
    callback(error, getResult(error, response, body));
  });
}

let prequest = Promise.promisify(request);

function getMax(appId, resource) {
  return prequest(appId, 'GET', `${resource}/count`, null, null)
    .then(function(result) {
      if (_.get(result, 'status') !== 200) {
        throw new Error(`${result.status}: ${resource}/count ${result.body}`);
      } else {
        return result.object.count;
      }
    });
}

function getAll(appId, resource, max, collection) {
  return Promise.map(_.range(0, max, 25),
    function(page) {
      return prequest(appId, 'GET', resource, null, {
        limit: 25,
        offset: page
      }).then(function(result) {
        if (_.get(result, 'status') !== 200) {
          throw new Error(`${result.status}: ${resource} ${result.body}`);
        } else {
          result.object.forEach(obj => obj ? collection.push(obj) : null);
        }
      });
    }, {
      concurrency: 10
    });
}

function forList(appId, resource, callback) {
  let collection = [];
  getMax(appId, resource).then(function(max) {
    return getAll(appId, resource, max, collection);
  }).then(function() {
    callback(null, collection);
  }).catch(callback);
}

function forObject(appId, method, resource, body, callback) {
  request(appId, method, resource, body, null, function(error, result) {
    if (_.get(result, 'status') !== 200) {
      callback(error || `${result.status}: ${resource} ${result.body}`);
    } else {
      callback(null, result.object);
    }
  });
}

function list(appId, resource, callback) {
  return forList(appId, resource, callback);
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
    list,
    get,
    post,
    put,
    del
  };
};
