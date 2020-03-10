class Request {
  constructor(site, version='1.0') {
    this.site = site;
    this.version = version;
  }

  _request(path, method, params) {
    if (method === 'GET') return get(path, params);

    return fetch(`${this.site}/api/${this.version}/${path}`, {
      method: method,
      body: JSON.stringify(params),
    });
  }
}

module.exports = Request;
