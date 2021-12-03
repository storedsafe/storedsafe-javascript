# StoredSafe JavaScript
JavaScript bindings for the StoredSafe RESTlike API. All methods are completely transparent and built on top of axios. This means the return value is the Promise returned by axios. No parsing is done whatsoever beyond saving the token returned by authentication requests for convenience.

## Install

```bash
npm install storedsafe
```

## Usage
The structure of the returned data is described in the [StoredSafe RESTlike API](https://developer.storedsafe.com) documentation.
For learning more about the Promise-based return values, look at the [axios](https://github.com/axios/axios) documentation.

### Authentication
```javascript
const StoredSafe = require('storedsafe');
const storedsafe = new StoredSafe('vault.my-storedsafe-site.com', 'my-api-key');

// token gets saved in StoredSafe object on successful request
storedsafe.loginYubikey(username, passphrase, otp)
  .then(res => res.data)
  .then(data => {
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
const StoredSafe = require('storedsafe');
const storedsafe = new StoredSafe(
  'vault.my-storedsafe-site.com',
  'my-api-key',
  'my-token'
);

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

### Method signatures
```typescript
constructor(site: string, apikey: string, token: string = null, version: string ='1.0')
loginYubikey(username: string, passphrase: string, otp: string)
loginTotp(username: string, passphrase: string, otp: string)
loginSmartcard(username: string, passphrase: string, otp: string)
logout()
check()
listVaults()
vaultObjects(id: string | number)
vaultMembers(id: string | number)
createVault(params: object)
editVault(id: string | number, params: object)
deleteVault(id: string | number)
object(id: string | number, children=false)
decryptObject(id: string | number)
createObject(params: object)
editObject(id: string | number, params: object)
deleteObject(id: string | number)
find(needle: string)
listTemplates()
template(id: string | number)
permissionBits()
passwordPolicies()
version()
generatePassword(params: {
  type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
  length?: number;
  language?: 'en_US' | 'sv_SE';
  delimeter?: string;
  words?: number;
  min_char?: number;
  max_char?: number;
  policyid?: string;
} = {})
```
