"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var LoginType;
(function (LoginType) {
    LoginType["TOTP"] = "totp";
    LoginType["SMARTCARD"] = "smc_rest";
})(LoginType = exports.LoginType || (exports.LoginType = {}));
var StoredSafe = /** @class */ (function () {
    function StoredSafe(site, apikey, token, version) {
        if (version === void 0) { version = '1.0'; }
        this.axios = axios_1.default.create({
            baseURL: "https://" + site + "/api/" + version + "/",
            timeout: 5000,
        });
        this.apikey = apikey;
        this.token = token;
    }
    StoredSafe.prototype.authYubikey = function (username, passphrase, otp) {
        var _this = this;
        return this.axios.post('/auth', {
            username: username,
            keys: "" + passphrase + this.apikey + otp,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.authTotp = function (username, passphrase, otp) {
        var _this = this;
        return this.axios.post('/auth', {
            username: username,
            passphrase: passphrase,
            otp: otp,
            logintype: LoginType.TOTP,
            apikey: this.apikey,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.authSmartcard = function (username, passphrase, otp) {
        var _this = this;
        return this.axios.post('/auth', {
            username: username,
            passphrase: passphrase,
            otp: otp,
            logintype: LoginType.SMARTCARD,
            apikey: this.apikey,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.logout = function () {
        var _this = this;
        return this.axios.get('/auth/logout', {
            params: { token: this.token },
        }).then(function (response) {
            _this.token = undefined;
            return response;
        });
    };
    StoredSafe.prototype.check = function () {
        return this.axios.post('/auth/check', {
            token: this.token
        });
    };
    StoredSafe.prototype.vaultList = function () {
        return this.axios.get('/vault', {
            params: { token: this.token },
        });
    };
    StoredSafe.prototype.vaultObjects = function (id) {
        return this.axios.get("/vault/" + id, {
            params: { token: this.token },
        });
    };
    StoredSafe.prototype.vaultCreate = function (params) {
        return this.axios.post('/vault', __assign(__assign({}, params), { token: this.token }));
    };
    StoredSafe.prototype.vaultEdit = function (id, params) {
        return this.axios.put("/vault/" + id, __assign(__assign({}, params), { token: this.token }));
    };
    StoredSafe.prototype.vaultDelete = function (id) {
        return this.axios.delete("/vault/" + id, {
            params: { token: this.token },
        });
    };
    StoredSafe.prototype.object = function (id, children) {
        if (children === void 0) { children = false; }
        return this.axios.get("/object/" + id, {
            params: { token: this.token, children: children },
        });
    };
    StoredSafe.prototype.objectDecrypt = function (id) {
        return this.axios.get("/object/" + id, {
            params: { token: this.token, decrypt: true },
        });
    };
    StoredSafe.prototype.objectCreate = function (params) {
        return this.axios.post('/object', __assign(__assign({}, params), { token: this.token }));
    };
    StoredSafe.prototype.objectEdit = function (id, params) {
        return this.axios.put("/object/" + id, __assign(__assign({}, params), { token: this.token }));
    };
    StoredSafe.prototype.objectDelete = function (id) {
        return this.axios.delete("/object/" + id, {
            params: { token: this.token },
        });
    };
    StoredSafe.prototype.find = function (needle) {
        return this.axios.get('/find', {
            params: { token: this.token, needle: needle },
        });
    };
    StoredSafe.prototype.templateList = function () {
        return this.axios.get('/template', {
            params: { token: this.token },
        });
    };
    StoredSafe.prototype.template = function (id) {
        return this.axios.get("/template/" + id, {
            params: { token: this.token },
        });
    };
    return StoredSafe;
}());
exports.default = StoredSafe;
