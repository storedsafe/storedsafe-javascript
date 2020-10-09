var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export * from './types';
import axios from 'axios';
export var LoginType;
(function (LoginType) {
    LoginType["TOTP"] = "totp";
    LoginType["SMARTCARD"] = "smc_rest";
})(LoginType || (LoginType = {}));
class StoredSafe {
    constructor({ host, apikey, token }, version = '1.0') {
        this.axios = axios.create({
            baseURL: `https://${host}/api/${version}/`,
            timeout: 5000
        });
        this.apikey = apikey;
        this.token = token;
    }
    assertApikeyExists() {
        if (this.apikey === undefined) {
            throw new Error('Path requires apikey, apikey is undefined.');
        }
    }
    assertTokenExists() {
        if (this.token === undefined) {
            throw new Error('Path requires token, token is undefined.');
        }
    }
    loginYubikey(username, passphrase, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertApikeyExists();
            const response = yield this.axios.post('/auth', {
                username: username,
                keys: `${passphrase}${this.apikey}${otp}`
            });
            this.token = response.data.CALLINFO.token;
            return response;
        });
    }
    loginTotp(username, passphrase, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertApikeyExists();
            const response = yield this.axios.post('/auth', {
                username: username,
                passphrase: passphrase,
                otp: otp,
                logintype: LoginType.TOTP,
                apikey: this.apikey
            });
            this.token = response.data.CALLINFO.token;
            return response;
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            const response = yield this.axios.get('/auth/logout', {
                headers: { 'X-Http-Token': this.token }
            });
            this.token = undefined;
            return response;
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.post('/auth/check', {}, { headers: { 'X-Http-Token': this.token } });
        });
    }
    listVaults() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/vault', {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    vaultObjects(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get(`/vault/${id}`, {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    vaultMembers(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get(`/vault/${id}/members`, {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    createVault(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.post('/vault', Object.assign({}, params), { headers: { 'X-Http-Token': this.token } });
        });
    }
    editVault(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.put(`/vault/${id}`, Object.assign({}, params), { headers: { 'X-Http-Token': this.token } });
        });
    }
    deleteVault(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.delete(`/vault/${id}`, {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    getObject(id, children = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get(`/object/${id}`, {
                params: { children: children },
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    decryptObject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get(`/object/${id}`, {
                params: { decrypt: true },
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    createObject(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.post('/object', Object.assign({}, params), { headers: { 'X-Http-Token': this.token } });
        });
    }
    editObject(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.put(`/object/${id}`, Object.assign({}, params), { headers: { 'X-Http-Token': this.token } });
        });
    }
    deleteObject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.delete(`/object/${id}`, {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    find(needle) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/find', {
                params: { needle: needle },
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    listTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/template', {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    getTemplate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get(`/template/${id}`, {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    statusValues() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/utils/statusvalues', {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    passwordPolicies() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/utils/policies', {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    version() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('/utils/version', {
                headers: { 'X-Http-Token': this.token }
            });
        });
    }
    generatePassword(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertTokenExists();
            return yield this.axios.get('utils/pwgen', {
                headers: { 'X-Http-Token': this.token },
                params
            });
        });
    }
}
export default StoredSafe;
