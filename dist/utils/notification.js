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
exports.sendStatusUpdateEmail = exports.sendNewOrderEmail = void 0;
const accountuser_1 = require("../models/accountuser");
const profile_1 = require("../models/profile");
const domain_1 = require("../models/domain");
const constants_1 = require("./constants");
const mailer_1 = require("./mailer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../../.env') });
const APP_LINK = process.env.APP_LINK;
const sendNewOrderEmail = (companyId, orderDetails, sendToAdmin = true) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const user = yield accountuser_1.default.findOne({ companyId }).select({
            name: 1,
            email: 1
        }).lean();
        if ((orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.paymentMethod) === constants_1.PAYMENT_METHOD.CASH
            ||
                (orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.status) === constants_1.ORDER_STATUS.CONFIRMED) {
            (0, mailer_1.sendEmail)('orderAdmin', user === null || user === void 0 ? void 0 : user.email, {
                name: (0, constants_1.Capitalize)(user === null || user === void 0 ? void 0 : user.name),
                orderId: orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.orderId,
                total: (0, constants_1.currencyFormatter)(orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.totalAfterTax),
                orderLink: `${APP_LINK}/orders/${orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails._id}`
            });
        }
        if ((orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.paymentMethod) === constants_1.PAYMENT_METHOD.CASH
            ||
                ((orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.paymentMethod) === constants_1.PAYMENT_METHOD.RAZORPAY
                    &&
                        (orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.status) === constants_1.ORDER_STATUS.CONFIRMED)) {
            const profileUser = yield profile_1.default.findById(orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.userId).select({
                name: 1,
                email: 1
            }).lean();
            console.log(profileUser);
            if (profileUser === null || profileUser === void 0 ? void 0 : profileUser.email) {
                const companyDetails = yield domain_1.default.findOne({ companyId }).lean();
                (0, mailer_1.sendEmail)((orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.paymentMethod) === constants_1.PAYMENT_METHOD.CASH ? 'orderCustomer' : 'orderCustomerPG', profileUser === null || profileUser === void 0 ? void 0 : profileUser.email, {
                    iLogo: ((_a = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _a === void 0 ? void 0 : _a.logo) || undefined,
                    name: (0, constants_1.Capitalize)(profileUser === null || profileUser === void 0 ? void 0 : profileUser.name) || "User",
                    orderId: orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.orderId,
                    total: (0, constants_1.currencyFormatter)(orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.totalAfterTax),
                    email: ((_b = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _b === void 0 ? void 0 : _b.email) || (user === null || user === void 0 ? void 0 : user.email),
                    storeName: ((_c = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _c === void 0 ? void 0 : _c.logoText) || (companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.name),
                    orderLink: `${APP_LINK}/${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.name}/orders`
                });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.sendNewOrderEmail = sendNewOrderEmail;
const sendStatusUpdateEmail = (companyId, orderDetails, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    try {
        const user = yield accountuser_1.default.findOne({ companyId }).select({
            name: 1,
            email: 1
        }).lean();
        const profileUser = yield profile_1.default.findById(orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.userId).select({
            name: 1,
            email: 1
        }).lean();
        if (profileUser === null || profileUser === void 0 ? void 0 : profileUser.email) {
            const companyDetails = yield domain_1.default.findOne({ companyId }).lean();
            (0, mailer_1.sendEmail)("orderUpdate", profileUser === null || profileUser === void 0 ? void 0 : profileUser.email, {
                iLogo: ((_d = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _d === void 0 ? void 0 : _d.logo) || undefined,
                name: (0, constants_1.Capitalize)(profileUser === null || profileUser === void 0 ? void 0 : profileUser.name) || "User",
                orderId: orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.orderId,
                total: (0, constants_1.currencyFormatter)(orderDetails === null || orderDetails === void 0 ? void 0 : orderDetails.totalAfterTax),
                email: ((_e = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _e === void 0 ? void 0 : _e.email) || (user === null || user === void 0 ? void 0 : user.email),
                storeName: ((_f = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.metaData) === null || _f === void 0 ? void 0 : _f.logoText) || (companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.name),
                orderLink: `${APP_LINK}/${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.name}/orders`,
                status: (0, constants_1.Capitalize)(status.toLowerCase())
            });
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
//# sourceMappingURL=notification.js.map