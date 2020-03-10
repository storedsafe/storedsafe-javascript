const nock = require('nock');
const axios = require('axios');

axios.defaults.adapter = require('axios/lib/adapters/http');
nock.disableNetConnect();

const { StoredSafe, LoginType } = require('./');

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
const reply_success = Object.freeze({
  CALLINFO: { token: token }
});
const reply_error = Object.freeze({
  ERRORS: [ 'ERROR' ],
});

// Sample parameters
const id = 1789;
const needle = 'waldo';
const params = Object.freeze({
  name: 'newname',
});
const params_with_token = Object.freeze({
  ...params,
  token: token,
});

// Declare storedsafe object variable (initialized in beforeEach)
let storedsafe;

describe("before authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe(site, apikey);
  });

  test(".auth with default (yubikey), sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        keys: keys,
      })
      .reply(200, reply_success);

    return storedsafe.auth(username, passphrase, otp)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth with yubikey, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        keys: keys,
      })
      .reply(200, reply_success);

    return storedsafe.auth(username, passphrase, otp, LoginType.YUBIKEY)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth with totp, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        passphrase: passphrase,
        otp: otp,
        apikey: apikey,
        logintype: LoginType.TOTP,
      })
      .reply(200, reply_success);

    return storedsafe.auth(username, passphrase, otp, LoginType.TOTP)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth with smartcard, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        passphrase: passphrase,
        otp: otp,
        apikey: apikey,
        logintype: LoginType.SMARTCARD,
      })
      .reply(200, reply_success);

    return storedsafe.auth(username, passphrase, otp, LoginType.SMARTCARD)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth_yubikey, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        keys: keys,
      })
      .reply(200, reply_success);

    return storedsafe.auth_yubikey(username, passphrase, otp)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth_totp, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        passphrase: passphrase,
        otp: otp,
        apikey: apikey,
        logintype: LoginType.TOTP,
      })
      .reply(200, reply_success);

    return storedsafe.auth_totp(username, passphrase, otp)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(token);
      });
  });

  test(".auth_smartcard, sets token", () => {
    const scope = nock(url)
      .post('/auth', {
        username: username,
        passphrase: passphrase,
        otp: otp,
        apikey: apikey,
        logintype: LoginType.SMARTCARD,
      })
      .reply(200, reply_success);

    return storedsafe.auth_smartcard(username, passphrase, otp)
      .then(res => {
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
      const scope = nock(url)
        .get('/auth/logout')
        .query({ token: token })
        .reply(200, reply_success)

      return storedsafe.logout()
        .then(res => {
          expect(res.status).toBe(200);
          expect(storedsafe.token).toBe(null);
        });
    });

    test(".check", () => {
      const scope = nock(url)
        .post('/auth/check', { token: token })
        .reply(200, reply_success);

      return storedsafe.check()
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  }); // END AUTH

  describe("/vault", () => {
    test(".vault_list", () => {
      const scope = nock(url)
        .get('/vault')
        .query({ token: token })
        .reply(200, reply_success);

      return storedsafe.vault_list()
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".vault_objects", () => {
      const scope = nock(url)
        .get(`/vault/${id}`)
        .query({ token: token })
        .reply(200, reply_success);

      return storedsafe.vault_objects(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".vault_create", () => {
      const scope = nock(url)
        .post('/vault', params_with_token)
        .reply(200, reply_success);

      return storedsafe.vault_create(params)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".vault_edit", () => {
      const scope = nock(url)
        .put(`/vault/${id}`, params_with_token)
        .reply(200, reply_success)

      return storedsafe.vault_edit(id, params)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".vault_delete", () => {
      const scope = nock(url)
        .delete(`/vault/${id}`)
        .query({ token: token })
        .reply(200, reply_success)

      return storedsafe.vault_delete(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  }); // END VAULT

  describe("/object", () => {
    test(".object, default (no children)", () => {
      const scope = nock(url)
        .get(`/object/${id}`)
        .query({ token: token, children: false })
        .reply(200, reply_success);

      return storedsafe.object(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object, no children", () => {
      const scope = nock(url)
        .get(`/object/${id}`)
        .query({ token: token, children: false })
        .reply(200, reply_success);

      return storedsafe.object(id, false)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object, with children", () => {
      const scope = nock(url)
        .get(`/object/${id}`)
        .query({ token: token, children: true })
        .reply(200, reply_success);

      return storedsafe.object(id, true)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object_decrypt", () => {
      const scope = nock(url)
        .get(`/object/${id}`)
        .query({ token: token, decrypt: true })
        .reply(200, reply_success);

      return storedsafe.object_decrypt(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object_create", () => {
      const scope = nock(url)
        .post(`/object`, params_with_token)
        .reply(200, reply_success);

      return storedsafe.object_create(params)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object_edit", () => {
      const scope = nock(url)
        .put(`/object/${id}`, params_with_token)
        .reply(200, reply_success);

      return storedsafe.object_edit(id, params)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".object_delete", () => {
      const scope = nock(url)
        .delete(`/object/${id}`)
        .query({ token: token })
        .reply(200, reply_success);

      return storedsafe.object_delete(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  }); // END OBJECT

  describe("/find", () => {
    test(".find", () => {
      const scope = nock(url)
        .get('/find')
        .query({ token: token, needle: needle })
        .reply(200, reply_success)

      return storedsafe.find(needle)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  }); // END FIND

  describe("/template", () => {
    test(".template_list", () => {
      const scope = nock(url)
        .get('/template')
        .query({ token: token })
        .reply(200, reply_success);

      return storedsafe.template_list()
        .then(res => {
          expect(res.status).toBe(200);
        });
    });

    test(".template", () => {
      const scope = nock(url)
        .get(`/template/${id}`)
        .query({ token: token })
        .reply(200, reply_success)

      return storedsafe.template(id)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  }); // END TEMPLATE
});

