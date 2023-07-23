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
const mongodb_1 = require("mongodb");
const sendresponse_1 = require("../../../services/response/sendresponse");
const profile_1 = require("../../../models/profile");
const orders_1 = require("../../../models/orders");
const PDFDocument = require("pdf-lib").PDFDocument;
class AdminOrderController {
    static getAnalytics(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let dateRange = req.query;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!dateRange) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("date range missing"));
                }
                let totalSales = (_a = (yield orders_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongodb_1.ObjectId(companyId),
                            createdAt: {
                                $gte: new Date(dateRange.fromDate),
                                $lte: new Date(dateRange.toDate),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalValue: { $sum: "$totalAfterTax" },
                            offlineValue: {
                                $sum: { $cond: ["$offline", "$totalAfterTax", 0] },
                            },
                        },
                    },
                ]))) === null || _a === void 0 ? void 0 : _a[0];
                let avgDailySales = (_b = (yield orders_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongodb_1.ObjectId(companyId),
                            createdAt: {
                                $gte: new Date(dateRange.fromDate),
                                $lte: new Date(dateRange.toDate),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                },
                            },
                            dailySales: { $sum: "$totalAfterTax" },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            avgDailySales: { $avg: "$dailySales" },
                            dailySales: { $push: { day: "$_id", sales: "$dailySales" } },
                        },
                    },
                ]))) === null || _b === void 0 ? void 0 : _b[0];
                let customers = yield profile_1.default.count({ companyId, createdAt: { $gte: new Date(dateRange.fromDate), $lte: new Date(dateRange.toDate) } }).lean();
                let orders = yield orders_1.default.count({
                    // @ts-nocheck 
                    // @ts-ignore
                    companyId: companyId,
                    createdAt: {
                        $gte: new Date(dateRange.fromDate),
                        $lte: new Date(dateRange.toDate),
                    },
                }).lean();
                let latestOrders = yield orders_1.default.find({
                    // @ts-ignore
                    companyId: companyId,
                    createdAt: {
                        $gte: new Date(dateRange.fromDate),
                        $lte: new Date(dateRange.toDate),
                    },
                })
                    .populate("userId")
                    .sort([["-id", -1]])
                    .limit(7)
                    .lean();
                console.log(JSON.stringify({ companyId, createdAt: { $gte: new Date(dateRange.fromDate), $lte: new Date(dateRange.toDate) } }));
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    totalSales,
                    avgDailySales,
                    customers,
                    orders,
                    latestOrders,
                }));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AdminOrderController;
//# sourceMappingURL=index.js.map