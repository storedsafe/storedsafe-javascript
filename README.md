# StoredSafe JavaScript
JavaScript bindings for the StoredSafe RESTlike API. All methods are completely transparent and built on top of axios. This means the return value is the Promise returned by axios. No parsing is done whatsoever beyond saving the token returned by authentication requests for convenience.

## Usage
The structure of the returned data is described in the [https://tracker.storedsafe.com/projects/storedsafe20/wiki/Version_10_release_documentation](StoredSafe RESTlike API) documentation.
For learning more about the Promise-based return values, look at the [https://github.com/axios/axios](axios) documentation.

### Authentication
```
const StoredSafe = require('storedsafe');

const storedsafe = new StoredSafe('vault.my-storedsafe-site.com', 'my-api-key');
storedsafe.authYubikey(username, passphrase, otp)
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
```
const StoredSafe = require('storedsafe');

const storedsafe = new StoredSafe(
  'vault.my-storedsafe-site.com',
  'my-api-key',
  'my-token'
);
storedsafe.objectDecrypt(42)
  .then(res => res.data)
  .then(data => {
    const secret = data.OBJECT[42].crypted;
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
```
constructor(site, apikey, token=null, version='1.0')
authYubikey(username, passphrase, otp)
authTotp(username, passphrase, otp)
authSmartcard(username, passphrase, otp)
logout()
check()
vaultList()
vaultObjects(id)
vaultCreate(params)
vaultEdit(id, params)
vaultDelete(id)
object(id, children=false)
objectDecrypt(id)
objectCreate(params)
objectEdit(id, params)
objectDelete(id)
find(needle)
templateList()
template(id)
```
