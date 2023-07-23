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
const products_1 = require("../../../models/products");
const sendresponse_1 = require("../../../services/response/sendresponse");
const inventory_1 = require("../../../models/inventory");
const moment = require("moment");
class InventoryController {
    static getInventory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let { limit = 10, offset = 0, startDate, endDate, sortBy = "createdAt", sortType = "desc", status, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = {
                    companyId: new mongodb_1.ObjectId(companyId),
                };
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (startDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery["$and"].push({
                        createdAt: {
                            $gte: moment(startDate).startOf("day").toDate(),
                        },
                    });
                }
                if (endDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery["$and"].push({
                        createdAt: {
                            $lte: moment(endDate).endOf("day").toDate(),
                        },
                    });
                }
                let inventoryDetails = yield inventory_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    // .populate("userId")
                    .lean();
                let count = yield inventory_1.default.count(mongoQuery);
                if (inventoryDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        inventoryDetails: inventoryDetails,
                        count,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getInventoryDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let inventoryId = req.params.inventoryId;
                let inventoryDetails = yield inventory_1.default.findOne({
                    _id: inventoryId,
                    companyId,
                })
                    .populate({
                    path: "products.productId",
                    select: {
                        name: 1,
                        sku: 1,
                        thumbnail: 1,
                    },
                })
                    .lean();
                return res.json((0, sendresponse_1.sendSuccessResponse)(inventoryDetails));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postInventory(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId, accountId } = req.user;
                if (!((_b = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.products) === null || _b === void 0 ? void 0 : _b.length)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("products is incorrect"));
                }
                let total = 0;
                req.body.products.map((it) => {
                    total = total + (it.purchasePrice || 0);
                });
                const newInventory = new inventory_1.default({
                    companyId: companyId,
                    userId: accountId,
                    customerName: req.body.customerName,
                    address: req.body.address,
                    gstin: req.body.gstin,
                    invoice: req.body.invoice,
                    total: parseFloat(total === null || total === void 0 ? void 0 : total.toFixed(2)),
                    contactPersonName: req.body.contactPersonName,
                    contactPersonNumber: req.body.contactPersonNumber,
                    products: req.body.products,
                    status: req.body.status || "IN_STOCK",
                    invoiceNumber: req.body.invoiceNumber,
                    purchaseDate: req.body.purchaseDate,
                    notes: req.body.notes,
                });
                req.body.products = yield Promise.all(req.body.products.map((product) => __awaiter(this, void 0, void 0, function* () {
                    let sku = product === null || product === void 0 ? void 0 : product.skuId;
                    if (!sku) {
                        if (product === null || product === void 0 ? void 0 : product.variantSKUId) {
                            let update = yield products_1.default.updateOne({
                                "variants.sku": product === null || product === void 0 ? void 0 : product.variantSKUId,
                                companyId,
                                _id: product === null || product === void 0 ? void 0 : product.productId,
                            }, { $inc: { ["variants.$[elem].quantity"]: product.count } }, {
                                arrayFilters: [{ "elem.sku": product === null || product === void 0 ? void 0 : product.variantSKUId }],
                                upsert: true,
                            });
                            return { update: !!update.ok, _id: sku };
                        }
                    }
                    else {
                        let update = yield products_1.default.updateOne({ sku: sku, companyId, _id: product === null || product === void 0 ? void 0 : product.productId }, { $inc: { quantity: product.count } }, {
                            upsert: true,
                        });
                        return { update: !!update.ok, _id: sku };
                    }
                    // await Products.updateOne(
                    // 	{ _id: new ObjectID(product.productId),companyId },
                    // 	{ $inc: { quantity: product.count || 0 } },
                    // 	{ upsert: true }
                    // );
                })));
                const savedInventory = yield newInventory.save();
                return res
                    .status(200)
                    .json((0, sendresponse_1.sendSuccessResponse)(savedInventory, "Inventory added successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = InventoryController;
//# sourceMappingURL=index.js.map