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
const message_1 = require("../../../models/message");
const sendresponse_1 = require("../../../services/response/sendresponse");
const profile_1 = require("../../../models/profile");
const utils_1 = require("./utils");
const moment = require("moment");
const constants_1 = require("../../../utils/constants");
class Messages {
    static postMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateMessage)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { name, mobile, message, type, productId, productDetails } = req.body;
                let timeInterval = moment().utcOffset('+05:30', true).subtract(24, 'hours').toDate();
                let profile = yield profile_1.default.findOne({
                    mobile: mobile,
                    companyId: companyId,
                }).lean();
                if (!(profile === null || profile === void 0 ? void 0 : profile._id)) {
                    profile = yield new profile_1.default({
                        mobile: mobile,
                        companyId: companyId
                    }).save();
                }
                const messages = yield message_1.default.find({
                    createdAt: { $gte: timeInterval },
                    userId: profile === null || profile === void 0 ? void 0 : profile._id,
                    companyId,
                    type,
                    productId
                });
                if (messages.length > 1) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Message created successfully!"));
                }
                yield new message_1.default({
                    message,
                    userId: profile === null || profile === void 0 ? void 0 : profile._id,
                    companyId,
                    type,
                    productId,
                    productDetails
                }).save();
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Message created successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllMessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "createdAt", sortType = "asc", status, startDate, endDate, type } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                if (type) {
                    mongoQuery.type = type;
                }
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { message: new RegExp(searchTerm, "i") }
                    ];
                }
                if (startDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery['$and'].push({ createdAt: {
                            $gte: moment(startDate).startOf("day").toDate(),
                        } });
                }
                if (endDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    console.log(moment(endDate).endOf("day").toDate());
                    mongoQuery["$and"].push({ createdAt: {
                            $lte: moment(endDate).endOf("day").toDate(),
                        } });
                }
                let messages = yield message_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .populate('userId', { name: 1, mobile: 1, verified: 1, email: 1 })
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let count = yield message_1.default.countDocuments(mongoQuery);
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    messages,
                    count
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = Messages;
//# sourceMappingURL=index.js.map