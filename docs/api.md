<a name="LoginRedirect"></a>

## LoginRedirect : <code>ReactComponent</code>
**Kind**: global class  
<a name="redirectToLogin"></a>

## redirectToLogin(redirectUrl)
Redirect the user to login

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| redirectUrl | <code>string</code> | the url to redirect to after login |

<a name="redirectToLogout"></a>

## redirectToLogout(redirectUrl)
Redirect the user to logout

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| redirectUrl | <code>string</code> | the url to redirect to after logout |

<a name="getAuthenticatedApiClient"></a>

## getAuthenticatedApiClient(config) ⇒ [<code>HttpClient</code>](#HttpClient)
Gets the apiClient singleton which is an axios instance.

**Kind**: global function  
**Returns**: [<code>HttpClient</code>](#HttpClient) - Singleton. A configured axios http client  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| [config.appBaseUrl] | <code>string</code> |  |
| [config.authBaseUrl] | <code>string</code> |  |
| [config.loginUrl] | <code>string</code> |  |
| [config.logoutUrl] | <code>string</code> |  |
| [config.loggingService] | <code>object</code> | requires logError and logInfo methods |
| [config.refreshAccessTokenEndpoint] | <code>string</code> |  |
| [config.accessTokenCookieName] | <code>string</code> |  |
| [config.csrfTokenApiPath] | <code>string</code> |  |

<a name="getAuthenticatedUser"></a>

## getAuthenticatedUser() ⇒ [<code>Promise.&lt;UserData&gt;</code>](#UserData) \| <code>Promise.&lt;null&gt;</code>
Gets the authenticated user's access token. Resolves to null if the user is unauthenticated.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;UserData&gt;</code>](#UserData) \| <code>Promise.&lt;null&gt;</code> - Resolves to the user's access token if they are logged in.  
<a name="ensureAuthenticatedUser"></a>

## ensureAuthenticatedUser(route) ⇒ [<code>Promise.&lt;UserData&gt;</code>](#UserData)
Ensures a user is authenticated. It will redirect to login when not authenticated.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | to return user after login when not authenticated. |

<a name="PrivateRoute"></a>

## PrivateRoute() : <code>ReactComponent</code>
**Kind**: global function  
<a name="HttpClient"></a>

## HttpClient
A configured axios client. See axios docs for more
info https://github.com/axios/axios. All the functions
below accept isPublic and isCsrfExempt in the request
config options. Setting these to true will prevent this
client from attempting to refresh the jwt access token
or a csrf token respectively.

```
 // A public endpoint (no jwt token refresh)
 apiClient.get('/path/to/endpoint', { isPublic: true });
```

```
 // A csrf exempt endpoint
 apiClient.post('/path/to/endpoint', { data }, { isCsrfExempt: true });
```

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| get | <code>function</code> |  |
| head | <code>function</code> |  |
| options | <code>function</code> |  |
| delete | <code>function</code> | (csrf protected) |
| post | <code>function</code> | (csrf protected) |
| put | <code>function</code> | (csrf protected) |
| patch | <code>function</code> | (csrf protected) |

<a name="UserData"></a>

## UserData
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| userId | <code>string</code> | 
| username | <code>string</code> | 
| roles | <code>array</code> | 
| administrator | <code>bool</code> | 

