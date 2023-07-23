"use strict";
/**
 * Refresh JWToken
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
const testuser_1 = require("../../../models/testuser");
const Locals_1 = require("../../../providers/Locals");
const sendresponse_1 = require("../../../services/response/sendresponse");
class RefreshToken {
    static getToken(req) {
        if (req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        }
        else if (req.query && req.query.token) {
            return req.query.token;
        }
        return "";
    }
    static perform(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const _token = RefreshToken.getToken(req);
            if (_token === "") {
                return res.json({
                    error: ["Invalid Token!"],
                });
            }
            const decode = jwt.decode(_token, Locals_1.default.config().appSecret, {
                expiresIn: 60 * 60 * 30,
            });
            const token = jwt.sign({
                email: decode === null || decode === void 0 ? void 0 : decode.email,
                name: decode === null || decode === void 0 ? void 0 : decode.name,
                companyId: decode === null || decode === void 0 ? void 0 : decode.companyId,
                accountId: decode === null || decode === void 0 ? void 0 : decode.accountId,
            }, Locals_1.default.config().appSecret, {
                expiresIn: 60 * 60 * 30,
            });
            const accountDetails = yield accountuser_1.default.findOne({
                email: decode.email,
            }).lean();
            return res.json((0, sendresponse_1.sendSuccessResponse)({
                token,
                token_expires_in: 10 * 600,
                account: accountDetails,
            }));
        });
    }
    static performTestUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const _token = RefreshToken.getToken(req);
            if (_token === "") {
                return res.json({
                    error: ["Invalid Token!"],
                });
            }
            const decode = jwt.decode(_token, Locals_1.default.config().profileSecret, {
                expiresIn: 60 * 60 * 30,
            });
            const token = jwt.sign({
                email: decode === null || decode === void 0 ? void 0 : decode.email,
                name: decode === null || decode === void 0 ? void 0 : decode.name,
                testUserId: decode === null || decode === void 0 ? void 0 : decode.testUserId,
            }, Locals_1.default.config().profileSecret, {
                expiresIn: 60 * 60 * 30,
            });
            const testUserDetails = yield testuser_1.default.findOne({
                _id: decode.testUserId,
            }).lean();
            return res.json((0, sendresponse_1.sendSuccessResponse)({
                token,
                token_expires_in: 10 * 600,
                testUser: testUserDetails,
            }));
        });
    }
}
exports.default = RefreshToken;
//# sourceMappingURL=RefreshToken.js.map