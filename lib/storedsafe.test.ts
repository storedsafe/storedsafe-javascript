import nock from 'nock';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');
nock.disableNetConnect();

import StoredSafe, { LoginType } from './';

// Sample StoredSafe configuration
const host = 'example.storedsafe.com';
const apikey = 'A1B2C3D4';
const token = 'abcde12345';
const version = '1.0';
const url = `https://${host}/api/${version}/`;

// Sample credentials
const username = 'JohnDoe';
const passphrase = 'p4ssw0rd';
const otp = '978675';
const keys = `${passphrase}${apikey}${otp}`;

// Sample HTTP reply data
const replySuccess = Object.freeze({
  CALLINFO: { token: token }
});

// Sample parameters
const id = 1789;
const needle = 'waldo';
const params = Object.freeze({
  name: 'newname',
});

// Declare storedsafe object variable (initialized in beforeEach)
let storedsafe: StoredSafe;

describe("before authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe({ host, apikey });
  });

  test(".loginYubikey, sets token", () => {
    nock(url).post('/auth', {
      username: username,
      keys: keys,
    }).reply(200, replySuccess);
    return storedsafe.loginYubikey(username, passphrase, otp)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(storedsafe.token).toBe(token);
    });
  });

  test(".loginTotp, sets token", () => {
    nock(url)
    .post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      apikey: apikey,
      logintype: LoginType.TOTP,
    })
    .reply(200, replySuccess);
    return storedsafe.loginTotp(
      username, passphrase, otp
    ).then((res) => {
      expect(res.status).toBe(200);
      expect(storedsafe.token).toBe(token);
    });
  });
});

describe("after authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe({ host, token });
  });

  describe("/auth", () => {
    test(".logout, removes token", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/auth/logout')
      .reply(200, replySuccess)
      return storedsafe.logout()
      .then(res => {
        expect(res.status).toBe(200);
        expect(storedsafe.token).toBe(undefined);
      });
    });

    test(".check", () => {
      nock(url, {
        reqheaders: {
          'x-http-token': token,
        },
      })
      .post('/auth/check')
      .reply(200, replySuccess);
      return storedsafe.check()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END AUTH

  describe("/vault", () => {
    test(".listVaults", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/vault')
      .reply(200, replySuccess);
      return storedsafe.listVaults()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultObjects", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/vault/${id}`)
      .reply(200, replySuccess);
      return storedsafe.vaultObjects(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".vaultMembers", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/vault/${id}/members`)
      .reply(200, replySuccess);
      return storedsafe.vaultMembers(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".createVault", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .post('/vault', params)
      .reply(200, replySuccess);
      return storedsafe.createVault(params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".editVault", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .put(`/vault/${id}`, params)
      .reply(200, replySuccess)
      return storedsafe.editVault(id, params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".deleteVault", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .delete(`/vault/${id}`)
      .reply(200, replySuccess)
      return storedsafe.deleteVault(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END VAULT

  describe("/object", () => {
    test(".object, default (no children)", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/object/${id}`)
      .query({ children: false })
      .reply(200, replySuccess);
      return storedsafe.object(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".object, no children", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/object/${id}`)
      .query({ children: false })
      .reply(200, replySuccess);
      return storedsafe.object(id, false)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".object, with children", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/object/${id}`)
      .query({ children: true })
      .reply(200, replySuccess);
      return storedsafe.object(id, true)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".decryptObject", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/object/${id}`)
      .query({ decrypt: true })
      .reply(200, replySuccess);
      return storedsafe.decryptObject(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".createObject", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .post(`/object`, params)
      .reply(200, replySuccess);
      return storedsafe.createObject(params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".editObject", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .put(`/object/${id}`, params)
      .reply(200, replySuccess);
      return storedsafe.editObject(id, params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".deleteObject", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .delete(`/object/${id}`)
      .reply(200, replySuccess);
      return storedsafe.deleteObject(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END OBJECT

  describe("/find", () => {
    test(".find", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/find')
      .query({ needle: needle })
      .reply(200, replySuccess)
      return storedsafe.find(needle)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END FIND

  describe("/template", () => {
    test(".listTemplates", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/template')
      .reply(200, replySuccess);
      return storedsafe.listTemplates()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".template", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get(`/template/${id}`)
      .reply(200, replySuccess)
      return storedsafe.template(id)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END TEMPLATE

  describe("/utils", () => {
    test(".permissionBits", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/utils/statusvalues')
      .reply(200, replySuccess);
      return storedsafe.permissionBits()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".passwordPolicies", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/utils/policies')
      .reply(200, replySuccess);
      return storedsafe.passwordPolicies()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".version", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/utils/version')
      .reply(200, replySuccess);
      return storedsafe.version()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });

    test(".generatePassword", () => {
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/utils/pwgen')
      .reply(200, replySuccess);
      return storedsafe.generatePassword()
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
    test(".generatePassword", () => {
      const params: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
        length?: number;
        language?: 'en_US' | 'sv_SE';
        delimeter?: string;
        words?: number;
        min_char?: number;
        max_char?: number;
        policyid?: string;
      } = {
        type: 'pin',
        length: 10,
        language: 'sv_SE',
        delimeter: '-',
        words: 4,
        min_char: 8,
        max_char: 16,
        policyid: '7',
      };
      nock(url, {
        reqheaders: {
          'X-Http-Token': token,
        },
      })
      .get('/utils/pwgen')
      .query(params)
      .reply(200, replySuccess);
      return storedsafe.generatePassword(params)
      .then(res => {
        expect(res.status).toBe(200);
      });
    });
  }); // END TEMPLATE

});

