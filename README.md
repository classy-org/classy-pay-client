# classy-pay-client
Simple client for Classy Pay.

# installation

 $ yarn install classy-pay-client

# usage

PayClient.request(appId, method, resource, payload, params, callback)

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

PayClient.request(0, 'GET', '/transaction/1', null, null, (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result);
  }
});


```
## Functions

<dl>
<dt><a href="#getHeaders">getHeaders(context, method, resource, payload)</a> ⇒ <code>Object</code></dt>
<dd><p>Get all the necessary headers for the request.</p>
</dd>
<dt><a href="#getQs">getQs(appId, params)</a> ⇒ <code>Object</code></dt>
<dd><p>Build the request query.</p>
</dd>
<dt><a href="#getOptions">getOptions(context, appId, method, resource, payload, params)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the request options.</p>
</dd>
<dt><a href="#getResult">getResult(error, response, body)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the response for http request.</p>
</dd>
<dt><a href="#request">request(context, appId, method, resource, payload, params, callback)</a></dt>
<dd><p>A general Pay request.</p>
</dd>
<dt><a href="#getMax">getMax(context, appId, resource)</a> ⇒ <code>Number</code></dt>
<dd><p>Retrieve the total number of objects for the resource.</p>
</dd>
<dt><a href="#getAll">getAll(context, appId, resource, max, collection)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get all the objects for a resource.</p>
</dd>
<dt><a href="#forList">forList(context, appId, resource, callback)</a></dt>
<dd><p>Get all objects.</p>
</dd>
<dt><a href="#forObject">forObject(context, appId, method, resource, body, callback)</a></dt>
<dd><p>Get an object.</p>
</dd>
<dt><a href="#list">list(context, appId, resource, callback)</a> ⇒ <code>Array</code></dt>
<dd><p>Get a list of objects for a resource.</p>
</dd>
<dt><a href="#get">get(context, appId, resource, callback)</a> ⇒ <code>Object</code></dt>
<dd><p>Get an object given a resource.</p>
</dd>
<dt><a href="#post">post(context, appId, resource, object, callback)</a> ⇒ <code>Object</code></dt>
<dd><p>Create an object at a resource.</p>
</dd>
<dt><a href="#put">put(context, appId, resource, object, callback)</a> ⇒ <code>Object</code></dt>
<dd><p>Update an object at a resource.</p>
</dd>
<dt><a href="#del">del(context, appId, resource, callback)</a> ⇒ <code>Object</code></dt>
<dd><p>Remove an object at a resource.</p>
</dd>
</dl>

<a name="getHeaders"></a>

## getHeaders(context, method, resource, payload) ⇒ <code>Object</code>
Get all the necessary headers for the request.

**Kind**: global function  
**Returns**: <code>Object</code> - the headers objects  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the request context |
| method | <code>String</code> | the HTTP method for the request |
| resource | <code>String</code> | the resource being requested |
| payload | <code>Object</code> | the body of the request |

<a name="getQs"></a>

## getQs(appId, params) ⇒ <code>Object</code>
Build the request query.

**Kind**: global function  
**Returns**: <code>Object</code> - params for request  

| Param | Type | Description |
| --- | --- | --- |
| appId | <code>Number</code> | the pay application id |
| params | <code>Object</code> | params passed by client user |

<a name="getOptions"></a>

## getOptions(context, appId, method, resource, payload, params) ⇒ <code>Object</code>
Get the request options.

**Kind**: global function  
**Returns**: <code>Object</code> - the options for the request  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the request context |
| appId | <code>Number</code> | the pay application id |
| method | <code>String</code> | the http method |
| resource | <code>String</code> | the resource for the request |
| payload | <code>Object</code> | the body of the request |
| params | <code>Object</code> | the params provided by the caller |

<a name="getResult"></a>

## getResult(error, response, body) ⇒ <code>Object</code>
Get the response for http request.

**Kind**: global function  
**Returns**: <code>Object</code> - a well formed response object  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Object</code> | the error |
| response | <code>Object</code> | the http response |
| body | <code>Object</code> | the body of the response |

<a name="request"></a>

## request(context, appId, method, resource, payload, params, callback)
A general Pay request.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| method | <code>String</code> | the http method |
| resource | <code>String</code> | the pay resource |
| payload | <code>Object</code> | the payload for the request |
| params | <code>Object</code> | the parameters for the request |
| callback | <code>Method</code> | a callback |

<a name="getMax"></a>

## getMax(context, appId, resource) ⇒ <code>Number</code>
Retrieve the total number of objects for the resource.

**Kind**: global function  
**Returns**: <code>Number</code> - the total number of objects for the resource  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |

<a name="getAll"></a>

## getAll(context, appId, resource, max, collection) ⇒ <code>Promise</code>
Get all the objects for a resource.

**Kind**: global function  
**Returns**: <code>Promise</code> - a promise when resolved populates the collection  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| max | <code>Number</code> | total objects to retrieve |
| collection | <code>Array</code> | the collection to add objects to |

<a name="forList"></a>

## forList(context, appId, resource, callback)
Get all objects.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| callback | <code>function</code> | the callback |

<a name="forObject"></a>

## forObject(context, appId, method, resource, body, callback)
Get an object.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| method | <code>String</code> | the http method |
| resource | <code>String</code> | the pay resource |
| body | <code>Object</code> | the body of the request |
| callback | <code>function</code> | the callback |

<a name="list"></a>

## list(context, appId, resource, callback) ⇒ <code>Array</code>
Get a list of objects for a resource.

**Kind**: global function  
**Returns**: <code>Array</code> - an array of objects  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| callback | <code>function</code> | the callback |

<a name="get"></a>

## get(context, appId, resource, callback) ⇒ <code>Object</code>
Get an object given a resource.

**Kind**: global function  
**Returns**: <code>Object</code> - an object  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| callback | <code>function</code> | the callback |

<a name="post"></a>

## post(context, appId, resource, object, callback) ⇒ <code>Object</code>
Create an object at a resource.

**Kind**: global function  
**Returns**: <code>Object</code> - the created object  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| object | <code>Object</code> | the object to create |
| callback | <code>function</code> | the callback |

<a name="put"></a>

## put(context, appId, resource, object, callback) ⇒ <code>Object</code>
Update an object at a resource.

**Kind**: global function  
**Returns**: <code>Object</code> - the updated object  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| object | <code>Object</code> | the updated object |
| callback | <code>function</code> | the callback |

<a name="del"></a>

## del(context, appId, resource, callback) ⇒ <code>Object</code>
Remove an object at a resource.

**Kind**: global function  
**Returns**: <code>Object</code> - the removed object  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | the context for the request |
| appId | <code>Number</code> | the pay application id |
| resource | <code>String</code> | the pay resource |
| callback | <code>function</code> | the callback |

