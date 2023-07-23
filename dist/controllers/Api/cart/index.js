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
const cart_1 = require("../../../models/cart");
class ProfileController {
    static getCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let cartDetails = yield cart_1.default.find({
                    userId: id,
                })
                    .populate("productId")
                    .lean();
                if (cartDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        cartDetails,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getCartCount(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let cartDetails = (_b = (_a = (yield cart_1.default.aggregate([
                    {
                        $match: {
                            userId: new mongodb_1.ObjectID(id),
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            quantity: {
                                $sum: "$quantity",
                            },
                        },
                    },
                ]))) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.quantity;
                if (cartDetails !== undefined) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        count: cartDetails,
                    }));
                }
                else {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        count: 0,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static alterCart(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cartDetails = req.body.cartDetails;
                let { id, companyId } = req.user;
                if (!cartDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("cartDetails needed"));
                }
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let productDetails = yield products_1.default.findOne({
                    _id: new mongodb_1.ObjectId(cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId),
                    companyId: new mongodb_1.ObjectId(companyId),
                }).lean();
                if (!productDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not found"));
                }
                let query = {}, variantData = {};
                if (cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU) {
                    let index = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants.findIndex(x => (x === null || x === void 0 ? void 0 : x.sku) === (cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU));
                    if (index === -1) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not found"));
                    }
                    query.variantSKU = cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU;
                    variantData.variantSKU = cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU;
                    variantData.size = (_a = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants[index]) === null || _a === void 0 ? void 0 : _a.size;
                    variantData.color = (_b = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants[index]) === null || _b === void 0 ? void 0 : _b.color;
                }
                if (((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) > 50) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("quantity exceeded", "2050"));
                }
                let cart = yield cart_1.default.updateOne(Object.assign({ productId: cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId, userId: id }, query), Object.assign(Object.assign(Object.assign({ userId: id, name: productDetails === null || productDetails === void 0 ? void 0 : productDetails.name, sku: productDetails === null || productDetails === void 0 ? void 0 : productDetails.sku }, cartDetails), variantData), { quantity: ((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) }), {
                    upsert: true,
                });
                let finalValue = yield cart_1.default.findOne({
                    productId: cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId,
                    userId: id,
                }).lean();
                if (cart === null || cart === void 0 ? void 0 : cart.ok) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "cart updated",
                        details: Object.assign(Object.assign({ _id: finalValue === null || finalValue === void 0 ? void 0 : finalValue._id, userId: id }, cartDetails), { quantity: ((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) }),
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postCart(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cartDetails = req.body.cartDetails;
                let { id, companyId } = req.user;
                if (!cartDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("cartDetails needed"));
                }
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let productDetails = yield products_1.default.findOne({
                    _id: new mongodb_1.ObjectId(cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId),
                    companyId: new mongodb_1.ObjectId(companyId),
                }).lean();
                if (!productDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not found"));
                }
                let query = {}, variantData = {};
                if (cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU) {
                    let index = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants.findIndex(x => (x === null || x === void 0 ? void 0 : x.sku) === (cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU));
                    if (index === -1) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not found"));
                    }
                    query.variantSKU = cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU;
                    variantData.variantSKU = cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.variantSKU;
                    variantData.size = (_a = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants[index]) === null || _a === void 0 ? void 0 : _a.size;
                    variantData.color = (_b = productDetails === null || productDetails === void 0 ? void 0 : productDetails.variants[index]) === null || _b === void 0 ? void 0 : _b.color;
                    console.log(variantData);
                }
                let previousCart = yield cart_1.default.findOne(Object.assign({ productId: cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId, userId: id }, query)).lean();
                if (((previousCart === null || previousCart === void 0 ? void 0 : previousCart.quantity) || 0) + ((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) > 50) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("quantity exceeded", "2050"));
                }
                let cart = yield cart_1.default.updateOne(Object.assign({ productId: cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId, userId: id }, query), Object.assign(Object.assign(Object.assign({ userId: id, name: productDetails === null || productDetails === void 0 ? void 0 : productDetails.name, sku: productDetails === null || productDetails === void 0 ? void 0 : productDetails.sku }, cartDetails), variantData), { quantity: ((previousCart === null || previousCart === void 0 ? void 0 : previousCart.quantity) || 0) + ((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) }), { upsert: true });
                console.log(cartDetails, "cartdetails");
                let finalValue = yield cart_1.default.findOne({
                    productId: cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.productId,
                    userId: id,
                }).lean();
                if (cart === null || cart === void 0 ? void 0 : cart.ok) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "cart updated",
                        details: Object.assign(Object.assign({ _id: finalValue === null || finalValue === void 0 ? void 0 : finalValue._id, userId: id }, cartDetails), { quantity: ((previousCart === null || previousCart === void 0 ? void 0 : previousCart.quantity) || 0) + ((cartDetails === null || cartDetails === void 0 ? void 0 : cartDetails.quantity) || 0) }),
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteCartAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let cart = yield cart_1.default.deleteMany({
                    userId: id,
                });
                if (cart === null || cart === void 0 ? void 0 : cart.ok) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "items deleted",
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cartIds = req.body.cartIds;
                let { id } = req.user;
                if (!cartIds || !(cartIds === null || cartIds === void 0 ? void 0 : cartIds.length)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("cartIds needed"));
                }
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let cart = yield cart_1.default.deleteMany({
                    _id: { $in: cartIds },
                    userId: id,
                });
                if (cart === null || cart === void 0 ? void 0 : cart.ok) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        message: "items deleted",
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ProfileController;
//# sourceMappingURL=index.js.map