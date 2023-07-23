"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../../../models/configuration");
const sendresponse_1 = require("../../../services/response/sendresponse");
const utils_1 = require("./utils");
const domain_1 = require("../../../models/domain");
const constants_1 = require("../../../utils/constants");
class Configurations {
    static getPublicConfiguration(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.body.domain;
                const { configurationType: type } = req.params;
                const data = yield configuration_1.default.findOne({
                    companyId,
                    type
                });
                let enabled = false;
                if (type === constants_1.configurationTypes.TERMS_AND_CONDITIONS) {
                    enabled = ((_b = (_a = req.body.domain) === null || _a === void 0 ? void 0 : _a.metaData) === null || _b === void 0 ? void 0 : _b.termsAndConditions) || false;
                }
                else if (type === constants_1.configurationTypes.PRIVACY_POLICY) {
                    enabled = ((_d = (_c = req.body.domain) === null || _c === void 0 ? void 0 : _c.metaData) === null || _d === void 0 ? void 0 : _d.privacyPolicy) || false;
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    enabled,
                    data
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getTermsAndConditions(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                const meta = yield domain_1.default.findOne({ companyId });
                const data = yield configuration_1.default.findOne({
                    companyId,
                    type: constants_1.configurationTypes.TERMS_AND_CONDITIONS
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    enabled: ((_a = meta === null || meta === void 0 ? void 0 : meta.metaData) === null || _a === void 0 ? void 0 : _a.termsAndConditions) || false,
                    data
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getNotificationConfiguration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let data = {};
                data = yield configuration_1.default.findOne({
                    companyId,
                    type: constants_1.configurationTypes.NOTIFICATION
                });
                data = (data === null || data === void 0 ? void 0 : data.data) || {};
                data = Object.assign(Object.assign({}, constants_1.notificationConfigConstant), data);
                return res.json((0, sendresponse_1.sendSuccessResponse)(data));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postTermsAndConditions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateTermsAndCondition)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { data, termsAndConditions } = req.body;
                let domain = yield domain_1.default.findOne({ companyId }).lean();
                if (domain) {
                    yield domain_1.default.updateOne({ _id: domain === null || domain === void 0 ? void 0 : domain._id }, { $set: { metaData: Object.assign(Object.assign({}, domain === null || domain === void 0 ? void 0 : domain.metaData), { termsAndConditions }) } });
                }
                yield configuration_1.default.findOneAndUpdate({
                    companyId,
                    type: constants_1.configurationTypes.TERMS_AND_CONDITIONS
                }, { type: constants_1.configurationTypes.TERMS_AND_CONDITIONS, data }, { upsert: true });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Terms and Conditions updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPrivacyPolicy(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                const meta = yield domain_1.default.findOne({ companyId });
                const data = yield configuration_1.default.findOne({
                    companyId,
                    type: constants_1.configurationTypes.PRIVACY_POLICY
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    enabled: ((_a = meta === null || meta === void 0 ? void 0 : meta.metaData) === null || _a === void 0 ? void 0 : _a.privacyPolicy) || false,
                    data
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postPrivacyPolicy(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validatePrivacyPolicy)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { data, privacyPolicy } = req.body;
                let domain = yield domain_1.default.findOne({ companyId }).lean();
                if (domain) {
                    yield domain_1.default.updateOne({ _id: domain === null || domain === void 0 ? void 0 : domain._id }, { $set: { metaData: Object.assign(Object.assign({}, domain === null || domain === void 0 ? void 0 : domain.metaData), { privacyPolicy }) } });
                }
                yield configuration_1.default.findOneAndUpdate({
                    companyId,
                    type: constants_1.configurationTypes.PRIVACY_POLICY
                }, { type: constants_1.configurationTypes.PRIVACY_POLICY, data }, { upsert: true });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Privacy policy updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postNotificationConfiguration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateNotificationConfiguration)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { data } = req.body;
                data = Object.assign(Object.assign({}, constants_1.notificationConfigConstant), data);
                yield configuration_1.default.findOneAndUpdate({
                    companyId,
                    type: constants_1.configurationTypes.NOTIFICATION
                }, { type: constants_1.configurationTypes.NOTIFICATION, data }, { upsert: true });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Notification configuration updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = Configurations;
//# sourceMappingURL=index.js.map