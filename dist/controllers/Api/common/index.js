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
const path = require("path");
const company_1 = require("../../../models/company");
const Locals_1 = require("../../../providers/Locals");
const upload_1 = require("../../../services/gcloud/upload");
const sendresponse_1 = require("../../../services/response/sendresponse");
const sharp = require("sharp");
const constants_1 = require("../../../utils/constants");
const transcationlogs_1 = require("../../../models/transcationlogs");
const messagelogs_1 = require("../../../models/messagelogs");
const crypto = require("crypto");
const axios = require("axios");
class CommonController {
    static appendTimestampToFileName(fileName) {
        const timestamp = Date.now();
        const parts = fileName.split(".");
        const extension = parts.pop();
        const newFileName = parts.join(".") + "_" + timestamp + "." + extension;
        return newFileName;
    }
    static upload(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let myFile = req.file;
                let compress = req.query.compress;
                myFile.originalname = CommonController.appendTimestampToFileName(myFile.originalname);
                if (((_a = myFile === null || myFile === void 0 ? void 0 : myFile.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image/")) && compress === "true") {
                    let buffer = yield sharp(myFile.buffer)
                        .webp({ quality: 80 })
                        .resize(1500, 1000, {
                        fit: "cover",
                        background: { r: 255, g: 255, b: 255, alpha: 0.0 },
                    })
                        .toBuffer();
                    myFile = {
                        buffer: buffer,
                        originalname: `${path.parse(myFile.originalname).name}.webp`,
                    };
                }
                // return res.json({name : myFile.originalname});
                let { companyId } = req.user;
                const imageUrl = yield (0, upload_1.uploadImage)(myFile, companyId);
                res.json((0, sendresponse_1.sendSuccessResponse)({
                    url: imageUrl,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static slackbot(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let text = (req.body.text || "");
                const webhookUrl = "https://hooks.slack.com/services/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"; // Replace with your actual Slack webhook URL
                const payload = {
                    text: text,
                    // attachments: [
                    //     {
                    //         fields: formValues.map(({ label, value }) => ({ title: label, value })),
                    //     },
                    // ],
                };
                const response = yield axios.post(webhookUrl, payload, {
                    headers: { "Content-Type": "application/json" },
                });
                console.log(response);
                res.json((0, sendresponse_1.sendSuccessResponse)({
                    response: response === null || response === void 0 ? void 0 : response.data,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static uploadForSocialLink(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const myFile = req.file;
                let { companyId } = req.user;
                const imageUrl = yield (0, upload_1.uploadImageForSocialLink)(myFile, companyId);
                res.json((0, sendresponse_1.sendSuccessResponse)({
                    url: imageUrl,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static createOrder(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let { sms, whatsapp } = req.body;
            let { companyId, accountId } = req.user;
            let { razorpayAppId, razorpaySecretKey } = Locals_1.default.config();
            // console.log(razorpayAppId, razorpaySecretKey, req.user);
            if (!razorpayAppId || !razorpaySecretKey) {
                return res.json((0, sendresponse_1.sendErrorResponse)("no razorpay app id"));
            }
            let company = yield company_1.default.findById(companyId);
            if (!company.sms) {
                company.sms = {
                    value: constants_1.PER_UNIT_CREDIT_COST.SMS,
                    totalUsed: 0,
                    totalCredits: 0,
                };
            }
            if (!company.whatsapp) {
                company.whatsapp = {
                    value: constants_1.PER_UNIT_CREDIT_COST.WHATSAPP,
                    totalUsed: 0,
                    totalCredits: 0,
                };
            }
            let smsAmount = (sms || 0) * company.sms.value;
            let whatsappAmount = (whatsapp || 0) * company.whatsapp.value;
            let totalAmount = (smsAmount || 0) + (whatsappAmount || 0);
            let totalAmountAfterTax = totalAmount + totalAmount * constants_1.PER_UNIT_CREDIT_COST.GST;
            totalAmountAfterTax = (0, constants_1.roundOff)(totalAmountAfterTax, true);
            let notes = [
                { type: constants_1.CREDIT_TYPES.SMS, value: constants_1.PER_UNIT_CREDIT_COST.SMS, credits: sms },
                {
                    type: constants_1.CREDIT_TYPES.WHATSAPP,
                    value: constants_1.PER_UNIT_CREDIT_COST.WHATSAPP,
                    credits: whatsapp,
                },
            ];
            const orderData = yield (0, constants_1.createRazorpayOrder)(razorpayAppId, razorpaySecretKey, +totalAmountAfterTax
            // notes
            );
            console.log(orderData);
            let razorpayData = {
                razorpayOrderId: orderData === null || orderData === void 0 ? void 0 : orderData.id,
                returnData: orderData,
            };
            if (razorpayData === null || razorpayData === void 0 ? void 0 : razorpayData.razorpayOrderId) {
                yield new transcationlogs_1.default({
                    companyId,
                    userId: accountId,
                    status: constants_1.RAZORPAY_STATUS.CREATED,
                    razorpayPaymentId: (_a = razorpayData === null || razorpayData === void 0 ? void 0 : razorpayData.returnData) === null || _a === void 0 ? void 0 : _a.receipt,
                    returnData: razorpayData === null || razorpayData === void 0 ? void 0 : razorpayData.returnData,
                    item: notes,
                    totalAmount: totalAmountAfterTax,
                    transactionStatus: constants_1.RAZORPAY_TRANSCATION_STATUS.IN,
                    gateway: constants_1.RAZORPAY_TRANSCATION_GATEWAY.RAZORPAY,
                    mode: "online",
                    orderId: razorpayData === null || razorpayData === void 0 ? void 0 : razorpayData.razorpayOrderId,
                }).save();
                return res.json((0, sendresponse_1.sendSuccessResponse)({ orderData: razorpayData }));
            }
        });
    }
    static getOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { companyId } = req.user;
            let company = yield company_1.default.findById(companyId);
            if (!company.sms) {
                company.sms = {
                    value: constants_1.PER_UNIT_CREDIT_COST.SMS,
                    totalUsed: 0,
                    totalCredits: 0,
                };
            }
            if (!company.whatsapp) {
                company.whatsapp = {
                    value: constants_1.PER_UNIT_CREDIT_COST.WHATSAPP,
                    totalUsed: 0,
                    totalCredits: 0,
                };
            }
            return res.json((0, sendresponse_1.sendSuccessResponse)({
                sms: company.sms,
                whatsapp: company.whatsapp,
                gst: constants_1.PER_UNIT_CREDIT_COST.GST,
            }));
        });
    }
    static updateRazorpayPayment(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let razorpay_order_id = req.body.razorpay_order_id;
                let { razorpayAppId, razorpaySecretKey } = Locals_1.default.config();
                console.log(razorpayAppId, razorpaySecretKey);
                if (!razorpayAppId || !razorpaySecretKey) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no razorpay app id"));
                }
                let { companyId } = req.user;
                if (!razorpay_order_id) {
                    throw new Error("Razorpay order id is required!");
                }
                const company = yield company_1.default.findById(companyId);
                if (!company) {
                    throw new Error("company details not found!");
                }
                const order = yield transcationlogs_1.default.findOne({
                    orderId: razorpay_order_id,
                }).lean();
                if (!order) {
                    throw new Error("order details not found!");
                }
                if ((order === null || order === void 0 ? void 0 : order.status) === constants_1.RAZORPAY_STATUS.COMPLETED) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Payment status updated successfully!"));
                }
                const generatedSignature = crypto
                    .createHmac("SHA256", razorpaySecretKey)
                    .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
                    .digest("hex");
                if (generatedSignature !== req.body.razorpay_signature) {
                    yield transcationlogs_1.default.findOneAndUpdate({
                        orderId: req.body.razorpay_order_id,
                    }, {
                        status: constants_1.RAZORPAY_STATUS.FAILED,
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
                        yield transcationlogs_1.default.findOneAndUpdate({
                            orderId: razorpay_order_id,
                        }, {
                            status: constants_1.RAZORPAY_STATUS.COMPLETED,
                            mode: mode,
                            returnData: Object.assign(Object.assign({}, order.returnData), req.body),
                            razorpayPaymentId: req.body.razorpay_payment_id,
                        });
                        yield CommonController.updateOrderToCompany(order);
                    }
                    else if (((_b = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _b === void 0 ? void 0 : _b.status) === "failed") {
                        yield transcationlogs_1.default.findOneAndUpdate({
                            razorpayOrderId: razorpay_order_id,
                        }, {
                            status: constants_1.RAZORPAY_STATUS.FAILED,
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
    static updateOrderToCompany(order) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            let { companyId } = order;
            const company = yield company_1.default.findById(companyId);
            if (!company) {
                throw new Error("Store details not found!");
            }
            yield company_1.default.findByIdAndUpdate(companyId, {
                sms: Object.assign(Object.assign({}, (company.sms || {
                    value: 0,
                    totalUsed: 0,
                    totalCredits: 0,
                })), { value: ((_a = company === null || company === void 0 ? void 0 : company.sms) === null || _a === void 0 ? void 0 : _a.value) || constants_1.PER_UNIT_CREDIT_COST.SMS, totalCredits: (((_b = company === null || company === void 0 ? void 0 : company.sms) === null || _b === void 0 ? void 0 : _b.totalCredits) || 0) +
                        ((_d = (_c = order === null || order === void 0 ? void 0 : order.item) === null || _c === void 0 ? void 0 : _c.find((it) => it.type === constants_1.CREDIT_TYPES.SMS)) === null || _d === void 0 ? void 0 : _d.credits) }),
                whatsapp: Object.assign(Object.assign({}, (company.whatsapp || {
                    value: 0,
                    totalUsed: 0,
                    totalCredits: 0,
                })), { value: ((_e = company === null || company === void 0 ? void 0 : company.whatsapp) === null || _e === void 0 ? void 0 : _e.value) || constants_1.PER_UNIT_CREDIT_COST.WHATSAPP, totalCredits: (((_f = company === null || company === void 0 ? void 0 : company.whatsapp) === null || _f === void 0 ? void 0 : _f.totalCredits) || 0) +
                        ((_h = (_g = order === null || order === void 0 ? void 0 : order.item) === null || _g === void 0 ? void 0 : _g.find((it) => it.type === constants_1.CREDIT_TYPES.WHATSAPP)) === null || _h === void 0 ? void 0 : _h.credits) }),
            });
        });
    }
    static updateRazorpayPaymentWebhook(req, res, next) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { payload } = req.body;
                let { razorpayAppId, razorpaySecretKey } = Locals_1.default.config();
                if (!razorpayAppId || !razorpaySecretKey) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no razorpay app id"));
                }
                if ((_a = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _a === void 0 ? void 0 : _a.entity) {
                    const { order_id, id } = (_b = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _b === void 0 ? void 0 : _b.entity;
                    const order = yield transcationlogs_1.default.findOne({
                        orderId: order_id,
                        status: constants_1.RAZORPAY_STATUS.CREATED,
                    }).lean();
                    if (order) {
                        const company = yield company_1.default.findById(order === null || order === void 0 ? void 0 : order.companyId);
                        if (company) {
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
                                    yield transcationlogs_1.default.findOneAndUpdate({
                                        orderId: order_id,
                                    }, {
                                        status: constants_1.RAZORPAY_STATUS.COMPLETED,
                                        mode: mode,
                                        returnData: Object.assign(Object.assign({}, order.returnData), payload.payment.entity),
                                        razorpayPaymentId: (_d = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _d === void 0 ? void 0 : _d.id,
                                    });
                                    yield CommonController.updateOrderToCompany(order);
                                }
                                else if (((_e = paymentData === null || paymentData === void 0 ? void 0 : paymentData.data) === null || _e === void 0 ? void 0 : _e.status) === "failed") {
                                    yield transcationlogs_1.default.findOneAndUpdate({
                                        orderId: order_id,
                                    }, {
                                        status: constants_1.RAZORPAY_STATUS.FAILED,
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
                let order = yield transcationlogs_1.default.findOneAndUpdate({
                    orderId: razorpay_order_id,
                }, {
                    status: constants_1.RAZORPAY_STATUS.FAILED,
                }).lean();
                return res.json((0, sendresponse_1.sendErrorResponse)("Payment status updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getTransactionLogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "createdAt", sortType = "desc", status = constants_1.RAZORPAY_STATUS.COMPLETED, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                let logs = yield transcationlogs_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .populate({
                    path: "userId",
                    select: {
                        name: 1,
                    },
                })
                    .lean();
                let totalCount = yield transcationlogs_1.default.find(mongoQuery).count();
                //  let products1 = await Promise.all(
                //    products.map(async (it) => {
                //      let _id = it?._id;
                //      if (!_id) return { update: false, _id };
                //      delete it?._id;
                //      let update = await Product.updateOne(
                //        { _id: _id },
                //        { status: [1, 2, 3, 4][getRandomIntInclusive(0, 3)] },
                //        {
                //          upsert: true,
                //        }
                //      );
                //      return { update: !!update.ok, _id: _id };
                //    })
                //  );
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    totalCount,
                    currentPage: offset / limit + 1,
                    logs,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getMessageLogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "createdAt", sortType = "desc", } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                let logs = yield messagelogs_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .populate({
                    path: "userId",
                    select: {
                        name: 1,
                    },
                })
                    .lean();
                let totalCount = yield transcationlogs_1.default.find(mongoQuery).count();
                //  let products1 = await Promise.all(
                //    products.map(async (it) => {
                //      let _id = it?._id;
                //      if (!_id) return { update: false, _id };
                //      delete it?._id;
                //      let update = await Product.updateOne(
                //        { _id: _id },
                //        { status: [1, 2, 3, 4][getRandomIntInclusive(0, 3)] },
                //        {
                //          upsert: true,
                //        }
                //      );
                //      return { update: !!update.ok, _id: _id };
                //    })
                //  );
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    totalCount,
                    currentPage: offset / limit + 1,
                    logs,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = CommonController;
//# sourceMappingURL=index.js.map