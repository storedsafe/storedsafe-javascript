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
    function StoredSafe(_a, version) {
        var host = _a.host, apikey = _a.apikey, token = _a.token;
        if (version === void 0) { version = '1.0'; }
        this.axios = axios_1.default.create({
            baseURL: "https://" + host + "/api/" + version + "/",
            timeout: 5000,
        });
        this.apikey = apikey;
        this.token = token;
    }
    StoredSafe.prototype.loginYubikey = function (username, passphrase, otp) {
        var _this = this;
        return this.axios.post('/auth', {
            username: username,
            keys: "" + passphrase + this.apikey + otp,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.loginTotp = function (username, passphrase, otp) {
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
    StoredSafe.prototype.loginSmartcard = function (username, passphrase, otp) {
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
            headers: { 'X-Http-Token': this.token },
        }).then(function (response) {
            _this.token = undefined;
            return response;
        });
    };
    StoredSafe.prototype.check = function () {
        return this.axios.post('/auth/check', {}, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.listVaults = function () {
        return this.axios.get('/vault', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.vaultObjects = function (id) {
        return this.axios.get("/vault/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.vaultMembers = function (id) {
        return this.axios.get("/vault/" + id + "/members", {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.createVault = function (params) {
        return this.axios.post('/vault', __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.editVault = function (id, params) {
        return this.axios.put("/vault/" + id, __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.deleteVault = function (id) {
        return this.axios.delete("/vault/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.object = function (id, children) {
        if (children === void 0) { children = false; }
        return this.axios.get("/object/" + id, {
            params: { children: children },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.decryptObject = function (id) {
        return this.axios.get("/object/" + id, {
            params: { decrypt: true },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.createObject = function (params) {
        return this.axios.post('/object', __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.editObject = function (id, params) {
        return this.axios.put("/object/" + id, __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.deleteObject = function (id) {
        return this.axios.delete("/object/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.find = function (needle) {
        return this.axios.get('/find', {
            params: { needle: needle },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.listTemplates = function () {
        return this.axios.get('/template', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.template = function (id) {
        return this.axios.get("/template/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.permissionBits = function () {
        return this.axios.get('/utils/statusvalues', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.passwordPolicies = function () {
        return this.axios.get('/utils/policies', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.version = function () {
        return this.axios.get('/utils/version', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.generatePassword = function (params) {
        if (params === void 0) { params = {}; }
        return this.axios.get('utils/pwgen', {
            headers: { 'X-Http-Token': this.token },
            params: params,
        });
    };
    return StoredSafe;
}());
exports.default = StoredSafe;
