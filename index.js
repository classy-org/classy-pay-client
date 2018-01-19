const req = require('requestretry');
const _ = require('lodash');
const Promise = require('bluebird');

function getHeaders(context, method, resource, payload) {
  return {
    'Authorization': context.hmacAuthorize.sign(
      method,
      resource,
      'application/json',
      payload ? JSON.stringify(payload) : null
    ),
    'User-Agent': 'ClassyPay Node.JS',
    'Content-Type': payload ? 'application/json' : undefined
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

function getOptions(context, appId, method, resource, payload, pagination) {
  return {
    method,
    url: `${context.config.apiUrl}${resource}`,
    qs: getQs(appId, pagination),
    body: payload ? JSON.stringify(payload) : null,
    timeout: context.config.timeout,
    headers: getHeaders(context, method, resource, payload)
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

function request(context, appId, method, resource, payload, pagination, callback) {
  let options = getOptions(context, appId, method, resource, payload, pagination);
  req(options, function(error, response, body) {
    callback(error, getResult(error, response, body));
  });
}

let prequest = Promise.promisify(request);

function getMax(context, appId, resource) {
  return prequest(context, appId, 'GET', `${resource}/count`, null, null)
    .then(function(result) {
      if (_.get(result, 'status') !== 200) {
        throw new Error(`${result.status}: ${resource}/count ${result.body}`);
      } else {
        return result.object.count;
      }
    });
}

function getAll(context, appId, resource, max, collection) {
  return Promise.map(_.range(0, max, 25),
    function(page) {
      return prequest(context, appId, 'GET', resource, null, {
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

function forList(context, appId, resource, callback) {
  let collection = [];
  getMax(context, appId, resource).then(function(max) {
    return getAll(context, appId, resource, max, collection);
  }).then(function() {
    callback(null, collection);
  }).catch(callback);
}

function forObject(context, appId, method, resource, body, callback) {
  request(context, appId, method, resource, body, null, function(error, result) {
    if (_.get(result, 'status') !== 200) {
      callback(error || `${result.status}: ${resource} ${result.body}`);
    } else {
      callback(null, result.object);
    }
  });
}

function list(context, appId, resource, callback) {
  return forList(context, appId, resource, callback);
}

function get(context, appId, resource, callback) {
  return forObject(context, appId, 'GET', resource, null, callback);
}

function post(context, appId, resource, object, callback) {
  return forObject(context, appId, 'POST', resource, object, callback);
}

function put(context, appId, resource, object, callback) {
  return forObject(context, appId, 'PUT', resource, object, callback);
}

function del(context, appId, resource, callback) {
  return forObject(context, appId, 'DELETE', resource, null, callback);
}

module.exports = (callerConfig) => {
  const config = callerConfig;
  if (!config || !config.apiUrl || !config.token || !config.secret) {
    throw new Error('You must provide apiUrl, token, and secret.');
  }
  const hmacAuthorize = require('authorization-hmac256')({
    service: 'CWS',
    token: config.token,
    secret: config.secret
  });
  const context = {config, hmacAuthorize};
  return {
    request: (appId, method, resource, payload, pagination, callback) => request(context, appId, method, resource, payload, pagination, callback),
    list: (appId, resource, callback) => list(context, appId, resource, callback),
    get: (appId, resource, callback) => get(context, appId, resource, callback),
    post: (appId, resource, object, callback) => post(context, appId, resource, object, callback),
    put: (appId, resource, object, callback) => put(context, appId, resource, object, callback),
    del: (appId, resource, callback) => del(context, appId, resource, callback)
  };
};
