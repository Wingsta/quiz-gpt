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
const sendresponse_1 = require("../../../services/response/sendresponse");
const profile_1 = require("../../../models/profile");
const moment = require("moment");
const constants_1 = require("../../../utils/constants");
class Customers {
    static getCustomers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "createdAt", sortType = "asc", status, startDate, endDate, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                mongoQuery["verified"] = true;
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { name: new RegExp(searchTerm, "i") },
                        { mobile: new RegExp(searchTerm, "i") },
                        { email: new RegExp(searchTerm, "i") }
                    ];
                }
                if (startDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery['$and'].push({
                        createdAt: {
                            $gte: moment(startDate).startOf("day").toDate(),
                        }
                    });
                }
                if (endDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    console.log(moment(endDate).endOf("day").toDate());
                    mongoQuery["$and"].push({
                        createdAt: {
                            $lte: moment(endDate).endOf("day").toDate(),
                        }
                    });
                }
                let data = yield profile_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let count = yield profile_1.default.countDocuments(mongoQuery);
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    data,
                    count
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getCustomerDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let customerId = req.params.customerId;
                if (!customerId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("customerId missing"));
                }
                let mongoQuery = { companyId };
                mongoQuery.verified = true;
                mongoQuery._id = customerId;
                let data = yield profile_1.default.findOne(mongoQuery).lean();
                console.log(mongoQuery);
                if (!data) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("user not found!", 1727));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(data));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = Customers;
//# sourceMappingURL=index.js.map