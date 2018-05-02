const req = require('requestretry');
const _ = require('lodash');
const Promise = require('bluebird');

/**
 * Get all the necessary headers for the request.
 *
 * @param {Object} context the request context
 * @param {String} method the HTTP method for the request
 * @param {String} resource the resource being requested
 * @param {Object} payload  the body of the request
 *
 * @return {Object} the headers objects
 */
function getHeaders(context, method, resource, payload) {
  return {
    'Authorization': context.hmacAuthorize.sign(
      method,
      resource,
      'application/json',
      payload ? JSON.stringify(payload) : null
    ),
    'User-Agent': 'ClassyPay Node.JS',
    'Content-Type': payload ? 'application/json' : undefined,
  };
}

/**
 * Build the request query.
 *
 * @param {Number} appId the pay application id
 * @param {Object} params params passed by client user
 *
 * @return {Object} params for request
 */
function getQs(appId, params) {
  return _.extend({
    appId,
    meta: true,
  }, params);
}

/**
 * Get the request options.
 *
 * @param {Object} context the request context
 * @param {Number} appId the pay application id
 * @param {String} method the http method
 * @param {String} resource the resource for the request
 * @param {Object} payload the body of the request
 * @param {Object} params the params provided by the caller
 *
 * @return {Object} the options for the request
 */
function getOptions(context, appId, method, resource, payload, params) {
  return {
    method,
    url: `${context.config.apiUrl}${resource}`,
    qs: getQs(appId, params),
    body: payload ? JSON.stringify(payload) : null,
    timeout: context.config.timeout,
    headers: getHeaders(context, method, resource, payload),
  };
}

/**
 * Get the response for http request.
 *
 * @param {Object} error the error
 * @param {Object} response the http response
 * @param {Object} body the body of the response
 *
 * @return {Object} a well formed response object
 */
function getResult(error, response, body) {
  return {
    status: _.get(response, 'statusCode'),
    error,
    response,
    body,
    object: (body &&
        response.headers['content-type'].includes('application/json')) ?
      JSON.parse(body) : body,
  };
}

/**
 * A general Pay request.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} method the http method
 * @param {String} resource the pay resource
 * @param {Object} payload the payload for the request
 * @param {Object} params the parameters for the request
 * @param {Method} callback a callback
 */
function request(context, appId, method, resource, payload, params, callback) {
  let options = getOptions(context, appId, method, resource, payload, params);
  req(options, function(error, response, body) {
    callback(error, getResult(error, response, body));
  });
}

let prequest = Promise.promisify(request);

/**
 * Retrieve the total number of objects for the resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 *
 * @return {Number} the total number of objects for the resource
 */
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

/**
 * Get all the objects for a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Number} max total objects to retrieve
 * @param {Array} collection the collection to add objects to
 *
 * @return {Promise} a promise when resolved populates the collection
 */
function getAll(context, appId, resource, max, collection) {
  return Promise.map(_.range(0, max, 25),
    function(page) {
      return prequest(context, appId, 'GET', resource, null, {
        limit: 25,
        offset: page,
      }).then(function(result) {
        if (_.get(result, 'status') !== 200) {
          throw new Error(`${result.status}: ${resource} ${result.body}`);
        } else {
          result.object.forEach((obj) => obj ? collection.push(obj) : null);
        }
      });
    }, {
      concurrency: 10,
    });
}

/**
 * Get all objects.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Function} callback the callback
 */
function forList(context, appId, resource, callback) {
  let collection = [];
  getMax(context, appId, resource).then(function(max) {
    return getAll(context, appId, resource, max, collection);
  }).then(function() {
    callback(null, collection);
  }).catch(callback);
}

/**
 * Get an object.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} method the http method
 * @param {String} resource the pay resource
 * @param {Object} body the body of the request
 * @param {Function} callback the callback
 */
function forObject(context, appId, method, resource, body, callback) {
  request(context, appId, method, resource, body, null,
    function(error, result) {
    if (_.get(result, 'status') !== 200) {
      callback(error || `${result.status}: ${resource} ${result.body}`);
    } else {
      callback(null, result.object);
    }
  });
}

/**
 * Get a list of objects for a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Function} callback the callback
 *
 * @return {Array} an array of objects
 */
function list(context, appId, resource, callback) {
  return forList(context, appId, resource, callback);
}

/**
 * Get an object given a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Function} callback the callback
 *
 * @return {Object} an object
 */
function get(context, appId, resource, callback) {
  return forObject(context, appId, 'GET', resource, null, callback);
}

/**
 * Create an object at a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Object} object the object to create
 * @param {Function} callback the callback
 *
 * @return {Object} the created object
 */
function post(context, appId, resource, object, callback) {
  return forObject(context, appId, 'POST', resource, object, callback);
}

/**
 * Update an object at a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Object} object the updated object
 * @param {Function} callback the callback
 *
 * @return {Object} the updated object
 */
function put(context, appId, resource, object, callback) {
  return forObject(context, appId, 'PUT', resource, object, callback);
}

/**
 * Remove an object at a resource.
 *
 * @param {Object} context the context for the request
 * @param {Number} appId the pay application id
 * @param {String} resource the pay resource
 * @param {Function} callback the callback
 *
 * @return {Object} the removed object
 */
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
    secret: config.secret,
  });
  const context = {config, hmacAuthorize};
  const methods = {
    request: (appId, method, resource, payload, params, callback) =>
      request(context, appId, method, resource, payload, params, callback),
    list: (appId, resource, callback) =>
      list(context, appId, resource, callback),
    get: (appId, resource, callback) => get(context, appId, resource, callback),
    post: (appId, resource, object, callback) =>
      post(context, appId, resource, object, callback),
    put: (appId, resource, object, callback) =>
      put(context, appId, resource, object, callback),
    del: (appId, resource, callback) => del(context, appId, resource, callback),
  };
  return Promise.promisifyAll(methods);
};
