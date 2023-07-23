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
const domain_1 = require("../../../models/domain");
const profile_1 = require("../../../models/profile");
const orders_1 = require("../../../models/orders");
const orderhistory_1 = require("../../../models/orderhistory");
const moment = require("moment");
const constants_1 = require("../../../utils/constants");
const utils_1 = require("./utils");
const PDFDocument = require("pdf-lib").PDFDocument;
const pdfkit_1 = require("../orders/pdfkit");
const notification_1 = require("../../../utils/notification");
class AdminOrderController {
    static getOneOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let id = req.params.id;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("id missing"));
                }
                let orderDetails = yield orders_1.default.findOne({ _id: new mongodb_1.ObjectId(id) })
                    .populate("userId")
                    .lean();
                let orderhistory = yield orderhistory_1.default.find({
                    orderId: new mongodb_1.ObjectId(id),
                })
                    .sort([["createdAt", -1]])
                    .limit(5);
                if (orderDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        orderDetails,
                        orderhistory,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOrders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let { limit = 10, offset = 0, startDate, endDate, sortBy = "createdAt", sortType = "desc", status, customerId, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId: new mongodb_1.ObjectId(companyId) };
                if (customerId) {
                    mongoQuery.userId = new mongodb_1.ObjectId(customerId);
                }
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                else {
                    mongoQuery["status"] = {
                        $nin: [
                            constants_1.ORDER_STATUS.PAYMENT_PROCESSING,
                            // ORDER_STATUS.PAYMENT_FAILED
                        ],
                    };
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
                let orderDetails = yield orders_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .populate("userId")
                    .lean();
                let count = yield orders_1.default.count(mongoQuery);
                if (orderDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        orderDetails,
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
    static getOrderHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let id = req.params.id;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("id missing"));
                }
                let { limit = 10, offset = 0, startDate, endDate, sortBy = "createdAt", sortType = "desc", status, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { orderId: new mongodb_1.ObjectId(id) };
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (startDate) {
                    mongoQuery["createdAt"] = { $gte: new Date(startDate) };
                }
                if (endDate) {
                    mongoQuery["createdAt"] = { $lte: new Date(endDate) };
                }
                let orderHistories = yield orderhistory_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let count = yield orderhistory_1.default.count(mongoQuery);
                if (orderHistories) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        orderHistories,
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
    static statusUpdate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let orderId = req.params.orderId;
                let status = req.body.status;
                let { companyId } = req.user;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!status) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("status needed"));
                }
                let update = yield orders_1.default.findOneAndUpdate({ companyId: companyId, _id: new mongodb_1.ObjectId(orderId) }, { $set: { status } }, { upsert: true });
                if (update === null || update === void 0 ? void 0 : update._id) {
                    const sendEmail = req.body.sendEmail;
                    if (sendEmail) {
                        (0, notification_1.sendStatusUpdateEmail)(companyId, update, status);
                    }
                    yield orderhistory_1.default.insertMany([{ orderId, status }]);
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ message: "updated status" }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static createOfflineOrder(req, res, next) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateOfflineOrder)(req.body);
                if (error) {
                    return res
                        .status(400)
                        .send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                const { products, total, mobile, name } = req.body;
                let profileUpdate = {
                    mobile,
                    companyId,
                    verified: true,
                };
                if (name.trim()) {
                    profileUpdate.name = name.trim();
                }
                let findInvalidProducts = yield AdminOrderController.findInvalidProducts(products, companyId);
                if (findInvalidProducts) {
                    return res
                        .json((0, sendresponse_1.sendErrorResponse)("Product quantity is invalid", 403));
                }
                const profileData = yield profile_1.default.findOneAndUpdate({ mobile, companyId }, profileUpdate, { upsert: true, new: true });
                let latestorderId = parseInt(`${(_b = (_a = (yield orders_1.default.find({ companyId: companyId })
                    .sort({ _id: -1 })
                    .limit(1)
                    .lean())) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.orderNumber}`) || 0;
                let orderNumber = latestorderId + 1;
                const prefix = ((_e = (_d = (_c = (yield domain_1.default.findOne({ companyId }).lean())) === null || _c === void 0 ? void 0 : _c.metaData) === null || _d === void 0 ? void 0 : _d.invoice) === null || _e === void 0 ? void 0 : _e.prefix) || 'INV';
                yield orders_1.default.create({
                    companyId,
                    orderId: `${prefix}${orderNumber}`,
                    orderNumber,
                    products,
                    userId: profileData === null || profileData === void 0 ? void 0 : profileData._id,
                    status: constants_1.ORDER_STATUS.DELIVERED,
                    total,
                    tax: 0,
                    totalAfterTax: total,
                    paymentMethod: constants_1.PAYMENT_METHOD.CASH,
                    offline: true,
                });
                let update = yield AdminOrderController.updateProducts(products, companyId, "DEC");
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Order created successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static updateProducts(products, companyId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(products.map((it) => __awaiter(this, void 0, void 0, function* () {
                let sku = it === null || it === void 0 ? void 0 : it.sku;
                if (!sku) {
                    if (it === null || it === void 0 ? void 0 : it.variantSKU) {
                        let update = yield products_1.default.updateOne({ "variants.sku": it === null || it === void 0 ? void 0 : it.variantSKU, companyId, _id: it === null || it === void 0 ? void 0 : it.productId }, {
                            $inc: {
                                ["variants.$[elem].quantity"]: type === "INC" ? it.quantity : -it.quantity,
                            },
                        }, {
                            arrayFilters: [{ "elem.sku": it === null || it === void 0 ? void 0 : it.variantSKU }],
                            upsert: true,
                        });
                        return { update: !!update.ok, _id: sku };
                    }
                }
                else {
                    let update = yield products_1.default.updateOne({ sku: sku, companyId, _id: it === null || it === void 0 ? void 0 : it.productId }, { $inc: { quantity: type === "INC" ? it.quantity : -it.quantity } }, {
                        upsert: true,
                    });
                    console.log(it);
                    return { update: !!update.ok, _id: sku };
                }
            })));
        });
    }
    static getPdfBlob(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let { id: orderId } = req.params;
                let domainDetails = (yield domain_1.default.find({ companyId }).lean())[0];
                let orderDetails = yield orders_1.default.findOne({ _id: orderId })
                    .populate("userId")
                    .lean();
                if (!domainDetails || !domainDetails.metaData) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("domain details missing"));
                }
                let { logo, bannerImg, logoText = "No Company Name", addressLine1 = "Address Line 1", addressLine2 = "Address Line 2", city = "City", pincode = "pincode", state = "state", mobile = "mobile", email = "email", } = domainDetails === null || domainDetails === void 0 ? void 0 : domainDetails.metaData;
                //   function repeatElements(arr, n) {
                //     const newArr = [];
                //     for (let i = 0; i < n; i++) {
                //       newArr.push(...arr);
                //     }
                //     return newArr;
                //   }
                //   orderDetails.products = repeatElements(orderDetails?.products, 15);
                let orderAddres = orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.deliveryAddress;
                let userDetails = orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.userId;
                let data = {
                    invoice_nr: (orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.orderId) || orderId,
                    logo: logo,
                    storeAddress: {
                        name: logoText,
                        address: addressLine1,
                        addressLine2,
                        city: city,
                        state: state,
                        mobile: mobile,
                        postal_code: pincode,
                    },
                    shipping: {
                        name: (orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.name) || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.name),
                        mobile: (userDetails === null || userDetails === void 0 ? void 0 : userDetails.mobile) || orderAddres,
                        address: orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.addressLine1,
                        addressLine2: orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.addressLine2,
                        city: orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.city,
                        state: orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.state,
                        postal_code: orderAddres === null || orderAddres === void 0 ? void 0 : orderAddres.pincode,
                    },
                    items: (_a = orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.products) === null || _a === void 0 ? void 0 : _a.map((it) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        return ({
                            item: `${it === null || it === void 0 ? void 0 : it.name} ${((_a = it.size) === null || _a === void 0 ? void 0 : _a.value) ? `| ${(_b = it.size) === null || _b === void 0 ? void 0 : _b.value}` : ""} ${((_c = it.color) === null || _c === void 0 ? void 0 : _c.alias)
                                ? `| ${(_d = it.color) === null || _d === void 0 ? void 0 : _d.alias}`
                                : ((_e = it.color) === null || _e === void 0 ? void 0 : _e.value)
                                    ? `| ${(_f = it.color) === null || _f === void 0 ? void 0 : _f.value}`
                                    : ""}`,
                            quantity: it === null || it === void 0 ? void 0 : it.quantity,
                            amount: (_h = (parseFloat((_g = it.price) === null || _g === void 0 ? void 0 : _g.toString()) * parseFloat(it.quantity))) === null || _h === void 0 ? void 0 : _h.toFixed(2),
                        });
                    }),
                    subtotal: (orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.totalAfterTax) || 0,
                    paid: 0,
                    delivery: (orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.delivery) || 0,
                };
                let batchSize = 8;
                let buffers = [];
                for (let i = 0; i <= ((_b = orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.products) === null || _b === void 0 ? void 0 : _b.length); i = i + batchSize) {
                    data.items =
                        ((_d = (_c = orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.products) === null || _c === void 0 ? void 0 : _c.slice(i, i + batchSize)) === null || _d === void 0 ? void 0 : _d.map((it) => {
                            var _a, _b, _c, _d, _e, _f, _g, _h;
                            return ({
                                item: `${it === null || it === void 0 ? void 0 : it.name} ${((_a = it.size) === null || _a === void 0 ? void 0 : _a.value) ? `| ${(_b = it.size) === null || _b === void 0 ? void 0 : _b.value}` : ""} ${((_c = it.color) === null || _c === void 0 ? void 0 : _c.alias) ? `| ${(_d = it.color) === null || _d === void 0 ? void 0 : _d.alias}` : ((_e = it.color) === null || _e === void 0 ? void 0 : _e.value) ? `| ${(_f = it.color) === null || _f === void 0 ? void 0 : _f.value}` : ""}`,
                                quantity: it === null || it === void 0 ? void 0 : it.quantity,
                                amount: (_h = (parseFloat((_g = it.price) === null || _g === void 0 ? void 0 : _g.toString()) * parseFloat(it.quantity))) === null || _h === void 0 ? void 0 : _h.toFixed(2),
                            });
                        })) || 0;
                    let buffer = yield (0, pdfkit_1.createInvoice)(data);
                    buffers.push(buffer);
                }
                const mergedPdf = yield PDFDocument.create();
                for (const pdfBytes of buffers) {
                    const pdf = yield PDFDocument.load(pdfBytes);
                    const copiedPages = yield mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });
                }
                const buf = yield mergedPdf.save(); // Uint8Array
                // await fs.writeFileSync("invoice.pdf", buf);
                if (buf) {
                    res.contentType("application/pdf");
                    res.send(Buffer.from(buf));
                    return;
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static findInvalidProducts(products, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            let productsPresent = yield products_1.default.find({
                _id: { $in: (products === null || products === void 0 ? void 0 : products.map((it) => it.productId)) || [] },
                companyId,
            }).lean();
            let findInvalidProducts = products.find((it) => {
                var _a, _b, _c, _d;
                let productPresent = productsPresent.find((pt) => pt._id.toString() === it.productId.toString());
                if (!it.sku) {
                    if (it.variantSKU) {
                        let quantity = (_b = (_a = productPresent.variants) === null || _a === void 0 ? void 0 : _a.find((vt) => vt.sku === it.variantSKU)) === null || _b === void 0 ? void 0 : _b.quantity;
                        let outOfStock = (_d = (_c = productPresent.variants) === null || _c === void 0 ? void 0 : _c.find((vt) => vt.sku === it.variantSKU)) === null || _d === void 0 ? void 0 : _d.outOfStock;
                        if (!quantity || quantity < it.quantity || outOfStock) {
                            return true;
                        }
                    }
                }
                else {
                    let quantity = productPresent === null || productPresent === void 0 ? void 0 : productPresent.quantity;
                    if (!quantity || quantity < it.quantity) {
                        return true;
                    }
                }
            });
            return findInvalidProducts;
        });
    }
}
exports.default = AdminOrderController;
//# sourceMappingURL=index.js.map