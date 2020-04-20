import nock from 'nock';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');
nock.disableNetConnect();

import StoredSafe, { LoginType } from './';

// Sample StoredSafe configuration
const site = 'example.storedsafe.com';
const apikey = 'A1B2C3D4';
const token = 'abcde12345';
const version = '1.0';
const url = `https://${site}/api/${version}/`;

// Sample credentials
const username = 'JohnDoe';
const passphrase = 'p4ssw0rd';
const otp = '978675';
const keys = `${passphrase}${apikey}${otp}`;

// Sample HTTP reply data
const replySuccess = Object.freeze({
  CALLINFO: { token: token }
});
const replyError = Object.freeze({
  ERRORS: [ 'ERROR' ],
});

// Sample parameters
const id = 1789;
const needle = 'waldo';
const params = Object.freeze({
  name: 'newname',
});
const paramsWithToken = Object.freeze({
  ...params,
  token: token,
});

// Declare storedsafe object variable (initialized in beforeEach)
let storedsafe: StoredSafe;

describe("before authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe(site, apikey);
  });

  test(".authYubikey, sets token", () => {
    nock(url).post('/auth', {
      username: username,
      keys: keys,
    }).reply(200, replySuccess);
    return storedsafe.authYubikey(username, passphrase, otp)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(storedsafe.token).toBe(token);
    });
  });

  test(".authTotp, sets token", () => {
    nock(url)
    .post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      apikey: apikey,
      logintype: LoginType.TOTP,
    })
    .reply(200, replySuccess);
    return storedsafe.authTotp(
      username, passphrase, otp
    ).then((res) => {
      expect(res.status).toBe(200);
      expect(storedsafe.token).toBe(token);
    });
  });

  test(".authSmartcard, sets token", () => {
    nock(url)
    .post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      apikey: apikey,
      logintype: LoginType.SMARTCARD,
    })
    .reply(200, replySuccess);
    return storedsafe.authSmartcard(
      username, passphrase, otp
    ).then(res => {
      expect(res.status).toBe(200);
      expect(storedsafe.token).toBe(token);
    });
  });
});

describe("after authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe(site, apikey, token);
  });

  describe("/auth", () => {
    test(".logout, removes token", () => {
      nock(url)
      .get('/auth/logout')
      .query({ token: token })
      .reply(200, replySuccess)
      return storedsafe.logout()
      .then(res => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(undefined);
      });
    });

    test(".check", () => {
      nock(url).post('/auth/check', {
        token: token
      }).reply(200, replySuccess);
      return storedsafe.check()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END AUTH

  describe("/vault", () => {
    test(".vaultList", () => {
      nock(url)
      .get('/vault')
      .query({ token: token })
      .reply(200, replySuccess);
      return storedsafe.vaultList()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultObjects", () => {
      nock(url)
      .get(`/vault/${id}`)
      .query({ token: token })
      .reply(200, replySuccess);
      return storedsafe.vaultObjects(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultCreate", () => {
      nock(url)
      .post('/vault', paramsWithToken)
      .reply(200, replySuccess);
      return storedsafe.vaultCreate(params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultEdit", () => {
      nock(url)
      .put(`/vault/${id}`, paramsWithToken)
      .reply(200, replySuccess)
      return storedsafe.vaultEdit(id, params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultDelete", () => {
      nock(url)
      .delete(`/vault/${id}`)
      .query({ token: token })
      .reply(200, replySuccess)
      return storedsafe.vaultDelete(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END VAULT

  describe("/object", () => {
    test(".object, default (no children)", () => {
      nock(url)
      .get(`/object/${id}`)
      .query({ token: token, children: false })
      .reply(200, replySuccess);
      return storedsafe.object(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".object, no children", () => {
      nock(url)
      .get(`/object/${id}`)
      .query({ token: token, children: false })
      .reply(200, replySuccess);
      return storedsafe.object(id, false)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".object, with children", () => {
      nock(url)
      .get(`/object/${id}`)
      .query({ token: token, children: true })
      .reply(200, replySuccess);
      return storedsafe.object(id, true)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".objectDecrypt", () => {
      nock(url)
      .get(`/object/${id}`)
      .query({ token: token, decrypt: true })
      .reply(200, replySuccess);
      return storedsafe.objectDecrypt(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".objectCreate", () => {
      nock(url)
      .post(`/object`, paramsWithToken)
      .reply(200, replySuccess);
      return storedsafe.objectCreate(params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".objectEdit", () => {
      nock(url)
      .put(`/object/${id}`, paramsWithToken)
      .reply(200, replySuccess);
      return storedsafe.objectEdit(id, params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".objectDelete", () => {
      nock(url)
      .delete(`/object/${id}`)
      .query({ token: token })
      .reply(200, replySuccess);
      return storedsafe.objectDelete(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END OBJECT

  describe("/find", () => {
    test(".find", () => {
      nock(url)
      .get('/find')
      .query({ token: token, needle: needle })
      .reply(200, replySuccess)
      return storedsafe.find(needle)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END FIND

  describe("/template", () => {
    test(".templateList", () => {
      nock(url)
      .get('/template')
      .query({ token: token })
      .reply(200, replySuccess);
      return storedsafe.templateList()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".template", () => {
      nock(url)
      .get(`/template/${id}`)
      .query({ token: token })
      .reply(200, replySuccess)
      return storedsafe.template(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END TEMPLATE
});

