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
const testuser_1 = require("../../../models/testuser");
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
class TestUserAuth {
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = req.body;
                const email = body.email;
                if (!email) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no email"));
                }
                let testUser = yield testuser_1.default.findOne({
                    email: body.email,
                }).lean();
                if (!(testUser === null || testUser === void 0 ? void 0 : testUser._id)) {
                    testUser = yield new testuser_1.default(body).save();
                }
                if (testUser === null || testUser === void 0 ? void 0 : testUser._id) {
                    const token = jwt.sign({
                        email: body.email,
                        name: body.firstName,
                        testUserId: testUser === null || testUser === void 0 ? void 0 : testUser._id,
                    }, Locals_1.default.config().profileSecret, {
                        expiresIn: 60 * 60 * 30,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ token, account: testUser }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("signup failed"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getTestUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { testUserId } = req.user;
                let testUser = yield testuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(testUserId),
                }).lean();
                if (!testUser) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Account not found"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(testUser, "success"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchTestUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { testUserId } = req.user;
                let testUser = yield testuser_1.default.findOne({
                    _id: new mongodb_1.ObjectID(testUserId),
                }).lean();
                if (!testUser) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testUser not found"));
                }
                let testUserUpdateDoc = req.body;
                if (!testUserUpdateDoc) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("body to update not found"));
                }
                delete testUserUpdateDoc._id;
                delete testUserUpdateDoc.password;
                if (testUserUpdateDoc.phoneNumber) {
                    let checkExisting = yield testuser_1.default.findOne({
                        phoneNumber: testUserUpdateDoc.phoneNumber,
                        _id: { $ne: new mongodb_1.ObjectId(testUserId) },
                    }).lean();
                    if (checkExisting) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Phone number is aldready registered"));
                    }
                }
                let testUserSaved = yield testuser_1.default.updateOne({ _id: testUserId }, { $set: Object.assign({}, testUserUpdateDoc) }, { upsert: true });
                if (testUserSaved === null || testUserSaved === void 0 ? void 0 : testUserSaved.ok)
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
exports.default = TestUserAuth;
//# sourceMappingURL=index.js.map