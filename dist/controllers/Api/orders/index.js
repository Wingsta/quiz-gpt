"use strict";
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
const company_1 = require("../../../models/company");
const sendresponse_1 = require("../../../services/response/sendresponse");
const cart_1 = require("../../../models/cart");
const orders_1 = require("../../../models/orders");
const moment = require("moment");
const orderhistory_1 = require("../../../models/orderhistory");
const constants_1 = require("../../../utils/constants");
const common_1 = require("../common/common");
const crypto = require("crypto");
const axios = require("axios");
const domain_1 = require("../../../models/domain");
const pdfkit_1 = require("./pdfkit");
const admin_orders_1 = require("../admin-orders");
const notification_1 = require("../../../utils/notification");
const sendNotifications_1 = require("../../../utils/sendNotifications");
const PDFDocument = require("pdf-lib").PDFDocument;
class ProfileController {
    static getOrders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, companyId } = req.user;
                if (!id) {
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
                    userId: new mongodb_1.ObjectId(id),
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
                let orderDetails = yield orders_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    // .populate("userId")
                    .lean();
                let count = yield orders_1.default.count(mongoQuery);
                if (orderDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        orderDetails: orderDetails,
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
    static getOrdersCount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, companyId } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let orderDetails = yield orders_1.default.count({
                    userId: new mongodb_1.ObjectId(id),
                    companyId: new mongodb_1.ObjectId(companyId),
                });
                if (orderDetails !== undefined) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        count: orderDetails,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPdfBlob(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, companyId } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
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
                        return {
                            item: `${it === null || it === void 0 ? void 0 : it.name} ${((_a = it.size) === null || _a === void 0 ? void 0 : _a.value) ? `| ${(_b = it.size) === null || _b === void 0 ? void 0 : _b.value}` : ""} ${((_c = it.color) === null || _c === void 0 ? void 0 : _c.alias)
                                ? `| ${(_d = it.color) === null || _d === void 0 ? void 0 : _d.alias}`
                                : ((_e = it.color) === null || _e === void 0 ? void 0 : _e.value)
                                    ? `| ${(_f = it.color) === null || _f === void 0 ? void 0 : _f.value}`
                                    : ""}`,
                            quantity: it === null || it === void 0 ? void 0 : it.quantity,
                            amount: (_h = (parseFloat((_g = it.price) === null || _g === void 0 ? void 0 : _g.toString()) * parseFloat(it.quantity))) === null || _h === void 0 ? void 0 : _h.toFixed(2),
                        };
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
    static postOrder(req, res, next) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cartId = req.body.cartId;
                let deliveryAddress = req.body.deliveryAddress;
                let paymentMethod = req.body.paymentMethod;
                let preview = req.body.preview;
                let selfPickup = req.body.selfPickup;
                let { id, companyId } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!preview && !deliveryAddress) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("deliveryAddress needed"));
                }
                if (!preview && !paymentMethod) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("deliveryAddress needed"));
                }
                let query = {};
                if (cartId === null || cartId === void 0 ? void 0 : cartId.length) {
                    query = { _id: { $in: cartId.map((it) => new mongodb_1.ObjectId(it)) } };
                }
                let cartIdFound = [];
                let products = (_a = (yield cart_1.default.find(Object.assign(Object.assign({}, query), { userId: new mongodb_1.ObjectId(id) }))
                    .populate("productId")
                    .lean())) === null || _a === void 0 ? void 0 : _a.map((it) => {
                    var _a, _b;
                    let product = it === null || it === void 0 ? void 0 : it.productId;
                    cartIdFound.push(it._id);
                    if (it === null || it === void 0 ? void 0 : it.variantSKU) {
                        let valid = true;
                        let index = (_a = product === null || product === void 0 ? void 0 : product.variants) === null || _a === void 0 ? void 0 : _a.findIndex((z) => z.sku === (it === null || it === void 0 ? void 0 : it.variantSKU));
                        if (index === -1) {
                            valid = false;
                        }
                        return {
                            name: product === null || product === void 0 ? void 0 : product.name,
                            sku: product === null || product === void 0 ? void 0 : product.sku,
                            quantity: (it === null || it === void 0 ? void 0 : it.quantity) || 1,
                            thumbnail: product === null || product === void 0 ? void 0 : product.thumbnail,
                            productId: product === null || product === void 0 ? void 0 : product._id,
                            price: (_b = product === null || product === void 0 ? void 0 : product.variants[index]) === null || _b === void 0 ? void 0 : _b.price,
                            variantSKU: it === null || it === void 0 ? void 0 : it.variantSKU,
                            size: it === null || it === void 0 ? void 0 : it.size,
                            color: it === null || it === void 0 ? void 0 : it.color,
                            valid,
                        };
                    }
                    return {
                        name: product === null || product === void 0 ? void 0 : product.name,
                        sku: product === null || product === void 0 ? void 0 : product.sku,
                        quantity: (it === null || it === void 0 ? void 0 : it.quantity) || 1,
                        thumbnail: product === null || product === void 0 ? void 0 : product.thumbnail,
                        productId: product === null || product === void 0 ? void 0 : product._id,
                        price: product === null || product === void 0 ? void 0 : product.price,
                        variantSKU: it === null || it === void 0 ? void 0 : it.variantSKU,
                        size: it === null || it === void 0 ? void 0 : it.size,
                        color: it === null || it === void 0 ? void 0 : it.color,
                        valid: product ? true : false,
                    };
                });
                products = products.filter((x) => x.valid);
                const reducedProduct = products.reduce((a, b) => {
                    a = a + ((b === null || b === void 0 ? void 0 : b.quantity) || 1) * ((b === null || b === void 0 ? void 0 : b.price) || 0);
                    return a;
                }, 0);
                let total = (products === null || products === void 0 ? void 0 : products.length) ? reducedProduct : 0;
                let tax = 0;
                if (!products) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("products not found"));
                }
                const orderAmount = (total + tax).toFixed(2);
                let { enableSelfPickup, pincode, deliveryCost } = yield (0, common_1.calculateDeliveryCharge)(companyId, orderAmount);
                if (selfPickup) {
                    pincode = [];
                    deliveryCost = 0;
                }
                let totalAfterTax = (total + tax + deliveryCost).toFixed(2);
                if (preview)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        userId: id,
                        products: products,
                        total,
                        tax,
                        delivery: deliveryCost,
                        totalAfterTax,
                        deliveryAddress,
                        paymentMethod,
                        pincode,
                        enableSelfPickup,
                    }));
                let findInvalidProducts = yield admin_orders_1.default.findInvalidProducts(products, companyId);
                if (findInvalidProducts) {
                    return res
                        .json((0, sendresponse_1.sendErrorResponse)("Product quantity is invalid", 403));
                }
                let status = constants_1.ORDER_STATUS.PROCESSING;
                let razorpayData = {};
                if (paymentMethod === constants_1.PAYMENT_METHOD.RAZORPAY) {
                    const company = yield company_1.default.findById(companyId);
                    if (!company) {
                        throw new Error("Store details not found!");
                    }
                    const { razorpayAppId, razorpaySecretKey } = company;
                    if (!(razorpayAppId && razorpaySecretKey)) {
                        throw new Error("Razorpay creds not found!");
                    }
                    const orderData = yield (0, constants_1.createRazorpayOrder)(razorpayAppId, razorpaySecretKey, +totalAfterTax);
                    razorpayData = {
                        razorpayOrderId: orderData === null || orderData === void 0 ? void 0 : orderData.id,
                        returnData: orderData,
                    };
                    status = constants_1.ORDER_STATUS.PAYMENT_PROCESSING;
                }
                let latestorderId = parseInt(`${(_c = (_b = (yield orders_1.default.find({ companyId: companyId })
                    .sort({ _id: -1 })
                    .limit(1)
                    .lean())) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.orderNumber}`) || 0;
                let orderNumber = latestorderId + 1;
                const prefix = ((_f = (_e = (_d = (yield domain_1.default.findOne({ companyId }).lean())) === null || _d === void 0 ? void 0 : _d.metaData) === null || _e === void 0 ? void 0 : _e.invoice) === null || _f === void 0 ? void 0 : _f.prefix) || "INV";
                let order = yield new orders_1.default(Object.assign({ userId: new mongodb_1.ObjectId(id), companyId: companyId, orderId: `${prefix}${orderNumber}`, orderNumber, products: products, status,
                    total,
                    tax, delivery: deliveryCost, totalAfterTax,
                    deliveryAddress,
                    paymentMethod,
                    selfPickup }, razorpayData)).save();
                if (order === null || order === void 0 ? void 0 : order._id) {
                    yield cart_1.default.deleteMany({
                        _id: { $in: cartIdFound.map((it) => new mongodb_1.ObjectID(it)) },
                    });
                    let update = yield admin_orders_1.default.updateProducts(products, companyId, 'DEC');
                    // sendNewOrderEmail(companyId, order);
                    (0, sendNotifications_1.sendMessage)(companyId, id, "orderCreationWhatsapp", "mobile", {
                        orderId: `${prefix}${orderNumber}`,
                        totalAfterTax,
                    });
                    return res.json((0, sendresponse_1.sendSuccessResponse)(Object.assign({}, order.toJSON())));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static updateRazorpayPayment(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let razorpay_order_id = req.body.razorpay_order_id;
                let { id, companyId } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!razorpay_order_id) {
                    throw new Error("Razorpay order id is required!");
                }
                const company = yield company_1.default.findById(companyId);
                if (!company) {
                    throw new Error("company details not found!");
                }
                const order = yield orders_1.default.findOne({ razorpayOrderId: razorpay_order_id }).lean();
                if (!order) {
                    throw new Error("order details not found!");
                }
                if ((order === null || order === void 0 ? void 0 : order.status) === constants_1.ORDER_STATUS.CONFIRMED) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Payment status updated successfully!"));
                }
                const { razorpayAppId, razorpaySecretKey } = company;
                const generatedSignature = crypto
                    .createHmac("SHA256", razorpaySecretKey)
                    .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
                    .digest("hex");
                if (generatedSignature !== req.body.razorpay_signature) {
                    yield orders_1.default.findOneAndUpdate({
                        razorpayOrderId: req.body.razorpay_order_id,
                    }, {
                        status: constants_1.ORDER_STATUS.PAYMENT_FAILED,
                    });
                    return res.json((0, sendresponse_1.sendErrorResponse)("Invalid Transaction!"));
                }
                let mode = "Others";
                // Get payment method from razorpay
                const paymentData = yield axios.get(`https://${razorpayAppId}:${razorpaySecretKey}@api.razorpay.com/v1/payments/${req.body.razorpay_payment_id}/?expand[]=card`);
                if (paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) {
                    const { method } = paymentData.data;
                    if (method) {
                        switch (method) {
                            case "card":
                                if (paymentData.data.card) {
                                    const { type } = paymentData.data.card;
                                    if (type) {
                                        if (type === "debit") {
                                            mode = "Debit";
                                        }
                                        else if (type === "credit") {
                                            mode = "Credit";
                                        }
                                    }
                                }
                                break;
                            case "upi":
                                mode = "UPI";
                                break;
                            case "netbanking":
                                mode = "Netbanking";
                                break;
                            case "wallet":
                                mode = "Wallet";
                                break;
                            case "emi":
                            case "cardless_emi":
                                mode = "EMI";
                                break;
                            default:
                                break;
                        }
                    }
                    if (((_a = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _a === void 0 ? void 0 : _a.status) === "captured") {
                        yield orders_1.default.findOneAndUpdate({
                            razorpayOrderId: razorpay_order_id,
                        }, {
                            status: constants_1.ORDER_STATUS.CONFIRMED,
                            mode: mode,
                            returnData: Object.assign(Object.assign({}, order.returnData), req.body),
                            razorpayPaymentId: req.body.razorpay_payment_id,
                        });
                        (0, notification_1.sendNewOrderEmail)(companyId, Object.assign(Object.assign({}, order), { status: constants_1.ORDER_STATUS.CONFIRMED }), false);
                    }
                    else if (((_b = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _b === void 0 ? void 0 : _b.status) === "failed") {
                        yield orders_1.default.findOneAndUpdate({
                            razorpayOrderId: razorpay_order_id,
                        }, {
                            status: constants_1.ORDER_STATUS.PAYMENT_FAILED,
                        });
                    }
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Payment status updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static updateRazorpayPaymentWebhook(req, res, next) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { payload } = req.body;
                if ((_a = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _a === void 0 ? void 0 : _a.entity) {
                    const { order_id, id } = (_b = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _b === void 0 ? void 0 : _b.entity;
                    const order = yield orders_1.default.findOne({
                        razorpayOrderId: order_id,
                        status: constants_1.ORDER_STATUS.PAYMENT_PROCESSING,
                    }).lean();
                    if (order) {
                        const company = yield company_1.default.findById(order === null || order === void 0 ? void 0 : order.companyId);
                        if (company && (company === null || company === void 0 ? void 0 : company.razorpayAppId) && (company === null || company === void 0 ? void 0 : company.razorpaySecretKey)) {
                            const { razorpayAppId, razorpaySecretKey } = company;
                            let mode = "Others";
                            // Get payment method from razorpay
                            const paymentData = yield axios.get(`https://${razorpayAppId}:${razorpaySecretKey}@api.razorpay.com/v1/payments/${id}/?expand[]=card`);
                            if (paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) {
                                const { method } = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data;
                                if (method) {
                                    switch (method) {
                                        case "card":
                                            if (paymentData.data.card) {
                                                const { type } = paymentData.data.card;
                                                if (type) {
                                                    if (type === "debit") {
                                                        mode = "Debit";
                                                    }
                                                    else if (type === "credit") {
                                                        mode = "Credit";
                                                    }
                                                }
                                            }
                                            break;
                                        case "upi":
                                            mode = "UPI";
                                            break;
                                        case "netbanking":
                                            mode = "Netbanking";
                                            break;
                                        case "wallet":
                                            mode = "Wallet";
                                            break;
                                        case "emi":
                                        case "cardless_emi":
                                            mode = "EMI";
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                if (((_c = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _c === void 0 ? void 0 : _c.status) === "captured") {
                                    yield orders_1.default.findOneAndUpdate({
                                        razorpayOrderId: order_id,
                                    }, {
                                        status: constants_1.ORDER_STATUS.CONFIRMED,
                                        mode: mode,
                                        returnData: Object.assign(Object.assign({}, order.returnData), payload.payment.entity),
                                        razorpayPaymentId: (_d = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _d === void 0 ? void 0 : _d.id,
                                    });
                                    (0, notification_1.sendNewOrderEmail)(order === null || order === void 0 ? void 0 : order.companyId, Object.assign(Object.assign({}, order), { status: constants_1.ORDER_STATUS.CONFIRMED }), false);
                                }
                                else if (((_e = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _e === void 0 ? void 0 : _e.status) === "failed") {
                                    yield orders_1.default.findOneAndUpdate({
                                        razorpayOrderId: order_id,
                                    }, {
                                        status: constants_1.ORDER_STATUS.PAYMENT_FAILED,
                                    });
                                }
                            }
                        }
                    }
                }
                res.status(200).send("Success");
            }
            catch (error) {
                next(error);
            }
        });
    }
    static cancelRazorpayPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let razorpay_order_id = req.body.razorpay_order_id;
                let order = yield orders_1.default.findOneAndUpdate({
                    razorpayOrderId: razorpay_order_id,
                }, {
                    status: constants_1.ORDER_STATUS.PAYMENT_FAILED,
                }).lean();
                if (order.products) {
                    let update = yield admin_orders_1.default.updateProducts(order.products, order.companyId.toString(), "DEC");
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("Payment status updated successfully!"));
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
                let { id, companyId } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!status) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("status needed"));
                }
                let update = yield orders_1.default.updateOne({ companyId: companyId, _id: new mongodb_1.ObjectId(orderId) }, { $set: { status } }, { upsert: true });
                if (update === null || update === void 0 ? void 0 : update.ok) {
                    yield orderhistory_1.default.insertMany([{ orderId: id, status }]);
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ message: "updated status" }));
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