const axios = require('axios');

LoginType = Object.freeze({
  YUBIKEY: 'yubikey',
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

  auth(username, passphrase, otp, logintype=LoginType.YUBIKEY) {
    if(logintype === LoginType.TOTP) {
      return this.auth_totp(username, passphrase, otp);
    } else if(logintype === LoginType.SMARTCARD) {
      return this.auth_smartcard(username, passphrase, otp);
    } else {
      return this.auth_yubikey(username, passphrase, otp);
    }
  }

  auth_yubikey(username, passphrase, otp) {
    return this.axios.post('/auth', {
      username: username,
      keys: `${passphrase}${this.apikey}${otp}`,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  auth_totp(username, passphrase, otp) {
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

  auth_smartcard(username, passphrase, otp) {
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

  vault_list() {
    return this.axios.get('/vault', {
      params: { token: this.token },
    });
  }

  vault_objects(id) {
    return this.axios.get(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  vault_create(params) {
    return this.axios.post('/vault', {
      ...params,
      token: this.token,
    });
  }

  vault_edit(id, params) {
    return this.axios.put(`/vault/${id}`, {
      ...params,
      token: this.token,
    });
  }

  vault_delete(id) {
    return this.axios.delete(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  object(id, children=false) {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, children: children },
    });
  }

  object_decrypt(id) {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, decrypt: true },
    });
  }

  object_create(params) {
    return this.axios.post('/object', {
      ...params,
      token: this.token,
    });
  }

  object_edit(id, params) {
    return this.axios.put(`/object/${id}`, {
      ...params,
      token: this.token,
    });
  }

  object_delete(id) {
    return this.axios.delete(`/object/${id}`, {
      params: { token: this.token },
    });
  }

  find(needle) {
    return this.axios.get('/find', {
      params: { token: this.token, needle: needle },
    });
  }

  template_list() {
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

module.exports = { StoredSafe, LoginType };
