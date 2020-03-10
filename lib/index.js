const axios = require('axios');

LoginType = Object.freeze({
  TOTP: 'totp',
  SMARTCARD: 'smc_rest',
});

class StoredSafe {

  constructor(site, apikey, token=null, version='1.0') {
    this.axios = axios.create({
      baseURL: `https://${site}/api/${version}/`,
      timeout: 5000,
    });
    this.apikey = apikey;
    this.token = token;
  }

  authYubikey(username, passphrase, otp) {
    return this.axios.post('/auth', {
      username: username,
      keys: `${passphrase}${this.apikey}${otp}`,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  authTotp(username, passphrase, otp) {
    return this.axios.post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      logintype: LoginType.TOTP,
      apikey: this.apikey,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  authSmartcard(username, passphrase, otp) {
    return this.axios.post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      logintype: LoginType.SMARTCARD,
      apikey: this.apikey,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  logout() {
    return this.axios.get('/auth/logout', {
      params: { token: this.token },
    }).then(response => {
      this.token = null;
      return response;
    });
  }

  check() {
    return this.axios.post('/auth/check', {
      token: this.token
    });
  }

  vaultList() {
    return this.axios.get('/vault', {
      params: { token: this.token },
    });
  }

  vaultObjects(id) {
    return this.axios.get(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  vaultCreate(params) {
    return this.axios.post('/vault', {
      ...params,
      token: this.token,
    });
  }

  vaultEdit(id, params) {
    return this.axios.put(`/vault/${id}`, {
      ...params,
      token: this.token,
    });
  }

  vaultDelete(id) {
    return this.axios.delete(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  object(id, children=false) {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, children: children },
    });
  }

  objectDecrypt(id) {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, decrypt: true },
    });
  }

  objectCreate(params) {
    return this.axios.post('/object', {
      ...params,
      token: this.token,
    });
  }

  objectEdit(id, params) {
    return this.axios.put(`/object/${id}`, {
      ...params,
      token: this.token,
    });
  }

  objectDelete(id) {
    return this.axios.delete(`/object/${id}`, {
      params: { token: this.token },
    });
  }

  find(needle) {
    return this.axios.get('/find', {
      params: { token: this.token, needle: needle },
    });
  }

  templateList() {
    return this.axios.get('/template', {
      params: { token: this.token },
    });
  }

  template(id) {
    return this.axios.get(`/template/${id}`, {
      params: { token: this.token },
    });
  }
}

module.exports = StoredSafe;
