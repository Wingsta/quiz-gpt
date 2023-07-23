"use strict";
/**
 * Define Login Login for the API
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
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
const jwt = require("jsonwebtoken");
// import { Types  } from "mongoose";
const Locals_1 = require("../../../providers/Locals");
const axios_1 = require("axios");
const sendresponse_1 = require("../../../services/response/sendresponse");
const profile_1 = require("../../../models/profile");
const constants_1 = require("../common/constants");
class ProfileController {
    static getProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId, id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let profileDetails = yield profile_1.default.findOne({
                    _id: id,
                    companyId: companyId,
                });
                if (profileDetails === null || profileDetails === void 0 ? void 0 : profileDetails._id) {
                    const token = jwt.sign({
                        name: profileDetails === null || profileDetails === void 0 ? void 0 : profileDetails.name,
                        mobile: profileDetails.mobile,
                        id: profileDetails === null || profileDetails === void 0 ? void 0 : profileDetails._id,
                        companyId: companyId,
                    }, Locals_1.default.config().profileSecret, {
                        expiresIn: 60 * 60 * 30,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "account created",
                        token: token,
                        profileDetails,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = req.body.domain;
                let mobile = req.body.mobile;
                let otp = req.body.otp;
                if (!domain) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("domainId needed"));
                }
                if (!mobile) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("mobileNumber needed"));
                }
                let profile = yield profile_1.default.findOne({
                    mobile: mobile,
                    companyId: domain === null || domain === void 0 ? void 0 : domain.companyId,
                }).lean();
                if (!otp || (profile.otp !== parseInt(otp))) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("otp missing/incorrect"));
                }
                if (!(profile === null || profile === void 0 ? void 0 : profile._id)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("profile not found"));
                }
                if (profile === null || profile === void 0 ? void 0 : profile._id) {
                    yield profile_1.default.updateOne({ _id: profile._id }, {
                        $set: {
                            otp: undefined,
                            verified: true
                        }
                    }, { upsert: true });
                    const token = jwt.sign({
                        name: profile === null || profile === void 0 ? void 0 : profile.name,
                        mobile: profile.mobile,
                        id: profile === null || profile === void 0 ? void 0 : profile._id,
                        companyId: domain === null || domain === void 0 ? void 0 : domain.companyId,
                    }, Locals_1.default.config().profileSecret, {
                        expiresIn: 60 * 60 * 30,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "account created",
                        token: token,
                        profile,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchProfile(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profile = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let companyId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.companyId;
                let profilePatchDetails = req.body.profile;
                if (!profile || !profilePatchDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("profileId needed"));
                }
                let profileDetails = yield profile_1.default.findOne({
                    _id: profile,
                    companyId: companyId,
                }).lean();
                if (profileDetails === null || profileDetails === void 0 ? void 0 : profileDetails._id) {
                    let id = profileDetails === null || profileDetails === void 0 ? void 0 : profileDetails._id;
                    delete profileDetails._id;
                    delete profileDetails.__v;
                    let update = yield profile_1.default.updateOne({ _id: id }, { $set: Object.assign(Object.assign({}, profileDetails), profilePatchDetails) }, { upsert: true });
                    if (!!update.ok)
                        return res.json((0, sendresponse_1.sendSuccessResponse)({
                            message: "account updated",
                            _id: id,
                            profileDetails: Object.assign(Object.assign({}, profileDetails), profilePatchDetails),
                        }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postAddress(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profile = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let address = req.body.address;
                if (!address) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("address needed"));
                }
                if (profile) {
                    let id = profile;
                    if (address.default) {
                        yield profile_1.default.updateOne({
                            _id: id,
                            "address.default": { $exists: true },
                        }, { $set: { "address.$.default": false } }
                        //  { upsert: true }
                        );
                    }
                    let update = yield profile_1.default.updateOne({ _id: id }, { $push: { address } }, { upsert: true });
                    if (!!update.ok)
                        return res.json((0, sendresponse_1.sendSuccessResponse)({
                            message: "address added",
                        }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchAddress(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profile = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let addressId = req.params.addressId;
                let address = req.body.address;
                if (!address) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("address needed"));
                }
                if (!addressId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("addressId needed"));
                }
                if (profile) {
                    let id = profile;
                    if (address.default) {
                        yield profile_1.default.updateOne({ _id: id, address: { $exists: true } }, { $set: { "address.$.default": false } }, { upsert: true });
                    }
                    let update = yield profile_1.default.updateOne({ _id: id, "address._id": addressId }, { $set: { "address.$": Object.assign({ _id: addressId }, address) } }, { upsert: true });
                    if (!!update.ok)
                        return res.json((0, sendresponse_1.sendSuccessResponse)({
                            message: "address updated",
                        }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static verifyProfile(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = req.body.domain;
                let mobile = req.params.mobile;
                if (!domain) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("domainId needed"));
                }
                if (!mobile) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("mobileNumber needed"));
                }
                let otp = Math.floor(100000 + Math.random() * 900000);
                let authorized = constants_1.authorizedMobile.indexOf(mobile) >= 0 ? true : false;
                if (authorized) {
                    otp = 321456;
                }
                let profile = yield profile_1.default.findOne({
                    mobile: mobile,
                    companyId: domain === null || domain === void 0 ? void 0 : domain.companyId,
                }).lean();
                if (!(profile === null || profile === void 0 ? void 0 : profile._id)) {
                    profile = yield new profile_1.default({
                        mobile: mobile,
                        companyId: domain === null || domain === void 0 ? void 0 : domain.companyId,
                        otp,
                    }).save();
                }
                else if (profile === null || profile === void 0 ? void 0 : profile._id) {
                    yield profile_1.default.updateOne({
                        mobile: mobile,
                        companyId: domain === null || domain === void 0 ? void 0 : domain.companyId,
                    }, { $set: { otp } }, { upsert: true });
                }
                if (authorized) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ message: "otp sent" }));
                }
                const response = yield (0, axios_1.default)(`https://2factor.in/API/R1/?module=TRANS_SMS&apikey=84b62449-9f5a-11eb-80ea-0200cd936042&to=${mobile}&from=SPRMCN&templatename=saravanan_code_2&var1=${((_a = domain === null || domain === void 0 ? void 0 : domain.metaData) === null || _a === void 0 ? void 0 : _a.logoText) || (domain === null || domain === void 0 ? void 0 : domain.name)}&var2=${otp}`);
                let status = ((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.Status) === "Success";
                if (status)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ message: "otp sent" }));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static checkMobile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let mobile = req.params.mobile;
                if (!mobile) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("mobileNumber needed"));
                }
                let profile = yield profile_1.default.findOne({
                    mobile: mobile,
                    companyId,
                }).lean();
                return res.json((0, sendresponse_1.sendSuccessResponse)(profile));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ProfileController;
//# sourceMappingURL=index.js.map