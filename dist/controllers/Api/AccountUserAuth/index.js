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
const accountuser_1 = require("../../../models/accountuser");
const bcrypt = require("bcryptjs");
// import { Types  } from "mongoose";
const Locals_1 = require("../../../providers/Locals");
const mongodb_1 = require("mongodb");
const sendresponse_1 = require("../../../services/response/sendresponse");
const generateHash = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = bcrypt.genSaltSync(10);
    const hash = yield bcrypt.hashSync(plainPassword, salt);
    return hash;
});
class AccountUserAuth {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = req.body;
                const email = body.email;
                if (!email) {
                    return res.json({ error: "no email" });
                }
                let account = yield accountuser_1.default.findOne({
                    email: body.email,
                }).lean();
                if (!account) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account does not exist!", 1001));
                }
                if (body.type !== "GOOGLE" && !account.password) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Incorrect Password!"));
                }
                if (!body.type &&
                    !(yield bcrypt.compare(body.password, account.password))) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Incorrect Password!"));
                }
                if (body.type === "GOOGLE" ||
                    !!(yield bcrypt.compare(body.password, account.password))) {
                    const token = jwt.sign({
                        email: body.email,
                        name: body.firstName,
                        accountId: account === null || account === void 0 ? void 0 : account._id,
                    }, Locals_1.default.config().appSecret, {
                        expiresIn: 60 * 60 * 30,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ account, token }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("login failed"));
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = req.body;
                const email = body.email;
                if (!email) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no email"));
                }
                let accountuser = yield accountuser_1.default.findOne({
                    email: body.email,
                }).lean();
                if (!(accountuser === null || accountuser === void 0 ? void 0 : accountuser._id)) {
                    accountuser = yield new accountuser_1.default(body).save();
                }
                if (accountuser === null || accountuser === void 0 ? void 0 : accountuser._id) {
                    const token = jwt.sign({
                        email: body.email,
                        name: body.firstName,
                        accountId: accountuser === null || accountuser === void 0 ? void 0 : accountuser._id,
                    }, Locals_1.default.config().appSecret, {
                        expiresIn: 60 * 60 * 30,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ token, account: accountuser }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("signup failed"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let { newPassword, oldPassword } = req.body;
                if (!newPassword) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("New password needed", 1001));
                }
                if (!oldPassword) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Old password needed", 1001));
                }
                let account = yield accountuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(accountId),
                }).lean();
                if (!account) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account not found"));
                }
                // if (
                // 	account.password &&
                // 	!(await bcrypt.compare(oldPassword, account.password))
                // ) {
                // 	return res.json(sendErrorResponse("Old Password is incorrect"));
                // }
                let password = yield generateHash(newPassword);
                let accountUser = yield accountuser_1.default.updateOne({ _id: accountId }, { $set: { password: password } }, { upsert: true });
                if (accountUser === null || accountUser === void 0 ? void 0 : accountUser.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({}, "success"));
                else
                    return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let { password } = req.body;
                if (!password) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("New password needed", 1001));
                }
                let account = yield accountuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(accountId),
                }).lean();
                if (!account) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account not found"));
                }
                // if (
                // 	account.password &&
                // 	!(await bcrypt.compare(oldPassword, account.password))
                // ) {
                // 	return res.json(sendErrorResponse("Old Password is incorrect"));
                // }
                password = yield generateHash(password);
                let accountUser = yield accountuser_1.default.updateOne({ _id: accountId }, { $set: { password: password } }, { upsert: true });
                if (accountUser === null || accountUser === void 0 ? void 0 : accountUser.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({}, "success"));
                else
                    return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAccountUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let account = yield accountuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(accountId),
                }).lean();
                if (!account) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account not found"));
                }
                if (account)
                    return res.json((0, sendresponse_1.sendSuccessResponse)(account, "success"));
                else
                    return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchAccountUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let account = yield accountuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(accountId),
                }).lean();
                if (!account) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account not found"));
                }
                let accountUpdateDoc = req.body;
                if (!accountUpdateDoc) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("body to update not found"));
                }
                delete accountUpdateDoc._id;
                delete accountUpdateDoc.password;
                if (accountUpdateDoc.phoneNumber) {
                    let checkExisting = yield accountuser_1.default.findOne({
                        phoneNumber: accountUpdateDoc.phoneNumber,
                        _id: { $ne: new mongodb_1.ObjectId(accountId) },
                    }).lean();
                    if (checkExisting) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Phone number is aldready registered"));
                    }
                }
                let accountUser = yield accountuser_1.default.updateOne({ _id: accountId }, { $set: Object.assign({}, accountUpdateDoc) }, { upsert: true });
                if (accountUser === null || accountUser === void 0 ? void 0 : accountUser.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({}, "success"));
                else
                    return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AccountUserAuth;
//# sourceMappingURL=index.js.map