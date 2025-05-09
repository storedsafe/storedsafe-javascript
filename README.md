# StoredSafe JavaScript
JavaScript bindings for the StoredSafe RESTlike API with TypeScript declarations.

By default, requests are handled using the [https](https://nodejs.org/api/https.html) library in NodeJS or the [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API in browsers. These "drivers" are selected automatically, but can be overridden during initialization if you wish to use another request library.

The final (optional) `options` parameter in every method can be used to pass parameters specific to the selected request driver.  
The response format also depends on the selected request driver.

## Install

```bash
npm install storedsafe
```

## Usage
The structure of the returned data is described in the [StoredSafe RESTlike API](https://developer.storedsafe.com) documentation.

The following pages may also be useful depending on whether you're running in NodeJS or in the browser:
- [NodeJS (https)](https://nodejs.org/api/https.html)
- [Browser (Fetch API)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### Authentication

```javascript
const { StoredSafe } = require('storedsafe');
const api = new StoredSafe({
  host: 'vault.my-storedsafe-site.com',
  apikey: 'my-api-key'
});

// token gets saved in StoredSafe object on successful request
api.loginYubikey(username, passphrase, otp)
  .then(res => res.data)
  .then(data => {
    // Token is already stored automatically in the `StoredSafe` object.
    const token = data.CALLINFO.token;
    console.log(token);
  }).catch(error) => {
    if (error.response.stats === 403) {
      console.log("Invalid credentials");
    } // Handle errors or HTTP status codes other than 200
  }).then(() => {
    // Always execute
  });
```

### Decrypt object with id 42
```javascript
const { StoredSafe } = require('storedsafe');
const api = new StoredSafe({
  host: 'vault.my-storedsafe-site.com',
  token: 'my-token'
});

storedsafe.decryptObject('42')
  .then(res => res.data)
  .then(data => {
    const secret = data.OBJECT.find((obj) => obj.id === '42').crypted;
    console.log(secret);
  }).catch(error) => {
    if (error.response.stats === 403) {
      console.log(error.response.data.ERRORS);
    } // Handle errors or HTTP status codes other than 200
  }).then(() => {
    // Always execute
  });
```

### Type hints
```typescript
// For browser applications, using the fetch library (fetch-driver)
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const { StoredSafe } = require('storedsafe')
const api = new StoredSafe<Response,RequestInit>({ host: 'my-host', token: 'my-token' })

// For node applications, using the https library (node-driver)
// https://nodejs.org/api/https.html#httpsrequestoptions-callback
const { StoredSafe } = require('storedsafe')
const { IncomingMessage } = require('node:http')
const { RequestOptions } = require('node:https')
const api = new StoredSafe<IncomingMessage,RequestOptions>({ host: 'my-host', token: 'my-token' })
```

### Method signatures
```typescript
constructor<ResType, OptType>(
  { site: string, apikey?: string, token?: string = null, options?: OptType = {} },
  version: string? ='1.0',
  driver: RequestDriver?
)
loginYubikey(username: string, passphrase: string, otp: string, options?: OptType)
loginTotp(username: string, passphrase: string, otp: string, options?: OptType)
loginSmartcard(username: string, passphrase: string, otp: string, options?: OptType)
logout(options?: OptType)
check(options?: OptType)
listVaults(options?: OptType)
vaultObjects(id: string | number, options?: OptType)
vaultMembers(id: string | number, options?: OptType)
addVaultMember(vaultId: string | number, userId: string | number, status: number, options?: OptType)
editVaultMember(vaultId: string | number, userId: string | number, status: number, options?: OptType)
removeVaultMember(vaultId: string | number, userId: string | number, options?: OptType)
createVault(params: object, options?: OptType)
editVault(id: string | number, params: object, options?: OptType)
deleteVault(id: string | number, options?: OptType)
object(id: string | number, children=false, options?: OptType)
decryptObject(id: string | number, options?: OptType)
getFile(id: string | number, options?: OptType)
createObject(params: object, options?: OptType)
editObject(id: string | number, params: object, options?: OptType)
deleteObject(id: string | number, options?: OptType)
find(needle: string, options?: OptType)
listTemplates(options?: OptType)
template(id: string | number, options?: OptType)
listUsers(options?: OptType)
getUser(id: string | number, options?: OptType)
createUser(params: object, options?: OptType)
deleteUser(id: string | number, options?: OptType)
permissionBits(options?: OptType)
passwordPolicies(options?: OptType)
version(options?: OptType)
generatePassword(params: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
    length?: number;
    language?: 'en_US' | 'sv_SE';
    delimeter?: string;
    words?: number;
    min_char?: number;
    max_char?: number;
    policyid?: string;
  } = {},
  options?: OptType
)
```

## Changelog

- 2.0.0
  - Change to new yubikey login format (requires StoredSafe v2.3.0 or later)
    - Uses logintype `yubikey_otp` and `passphrase`+`otp` instead of `keys`
    - The loginYubikey method signature is unchanged
- 1.3.1
  - Fixed script crashing on failed login
  - Updated README with global options signature
  - Added changelog to README
- 1.3.0
  - Added global driver options to be passed with all requests
- 1.2.4
  - Fixed node driver not reading whole response
- 1.2.2
  - Fixed typo in path for vault member endpoints
- 1.2.1
  - Updated README
- 1.2.0
  - Added methods for vault member management
- 1.1.0
  - Added methods for user management
- 1.0.0
  - Added method for getting files from StoredSafe
  - Replaced axios with `node:http` for nodejs and `fetch` for browser

## Migrating from 0.2.0

- Axios is no longer used to make HTTP requests. Any references to axios-specific responses or errors should be replaced with either the `node:http` or `fetch` equivalents.
- The `StoredSafe` class is no longer a default export. `import StoredSafe from 'storedsafe'` should be replaced with `import { StoredSafe } from 'storedsafe'`.
