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
exports.notificationConfigConstant = exports.messageTypeConstant = exports.messageType = exports.replaceSpecialChars = exports.configurationTypes = exports.Capitalize = exports.currencyFormatter = exports.deliveryFlatFeeConstants = exports.deliveryFeeConstants = exports.deliveryZoneConstants = exports.createRazorpayOrder = exports.roundOff = exports.PAYMENT_METHOD = exports.CREDIT_TYPES = exports.PER_UNIT_CREDIT_COST = exports.RAZORPAY_TRANSCATION_GATEWAY = exports.RAZORPAY_TRANSCATION_STATUS = exports.RAZORPAY_STATUS = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = {
    PROCESSING: "PROCESSING",
    PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
    CONFIRMED: "CONFIRMED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED",
    DELIVERY_CANCELLED: "DELIVERY_CANCELLED"
};
exports.RAZORPAY_STATUS = {
    CREATED: "CREATED",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    PROCESSING: "PROCESSING"
};
exports.RAZORPAY_TRANSCATION_STATUS = {
    IN: "IN",
    OUT: "OUT",
    REFUND: "REFUND"
};
exports.RAZORPAY_TRANSCATION_GATEWAY = {
    RAZORPAY: "RAZORPAY"
};
exports.PER_UNIT_CREDIT_COST = {
    SMS: 0.25,
    WHATSAPP: 0.7,
    GST: 0.18
};
exports.CREDIT_TYPES = {
    SMS: "SMS",
    WHATSAPP: "WHATSAPP",
};
exports.PAYMENT_METHOD = {
    CARD: "CARD",
    CASH: "CASH",
    UPI: "UPI",
    NETBANKING: "NET-BANKING",
    FREE: "FREE",
    RAZORPAY: "RAZORPAY"
};
const roundOff = (num, includeDecimal) => {
    let temp = Number(num);
    return includeDecimal
        ? Math.round((temp + Number.EPSILON) * 100) / 100
        : Math.round(temp);
};
exports.roundOff = roundOff;
const Razorpay = require('razorpay');
const uuid = require('uuid');
const createRazorpayOrder = (key_id, key_secret, amount, notes) => {
    const instance = new Razorpay({
        key_id,
        key_secret
    });
    const options = {
        amount: (0, exports.roundOff)(amount, true) * 100,
        currency: "INR",
        receipt: uuid.v4(),
        payment_capture: 1,
        notes: notes || []
    };
    console.log(options);
    return new Promise((resolve, reject) => {
        instance.orders.create(options, (error, order) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                let message = 'Something failed, please try again.';
                if (error.error && error.error.description) {
                    message = error.error.description;
                }
                reject(new Error(message));
            }
            resolve(order);
        }));
    });
};
exports.createRazorpayOrder = createRazorpayOrder;
exports.deliveryZoneConstants = {
    NO_LIMITATION: "NO_LIMITATION",
    ADVANCED: "ADVANCED"
};
exports.deliveryFeeConstants = {
    "FREE": "FREE",
    "FLAT": "FLAT",
    "CUSTOM": "CUSTOM"
};
exports.deliveryFlatFeeConstants = {
    "AMOUNT": "AMOUNT",
    "PERCENTAGE": "PERCENTAGE"
};
const currencyFormatter = (input, needSymbol = true) => {
    let options = needSymbol ? {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    } : {
        minimumFractionDigits: 0
    };
    if (input) {
        return (input).toLocaleString('en-IN', options);
    }
    else {
        return (0).toLocaleString('en-IN', options);
    }
};
exports.currencyFormatter = currencyFormatter;
const Capitalize = text => {
    try {
        return text ? text[0].toUpperCase() + text.slice(1) : "";
    }
    catch (e) {
        return "";
    }
};
exports.Capitalize = Capitalize;
exports.configurationTypes = {
    TERMS_AND_CONDITIONS: "terms and conditions",
    PRIVACY_POLICY: "privacy policy",
    NOTIFICATION: "notification"
};
const replaceSpecialChars = (text, sendEmptyString) => {
    return text
        ? String(text).trim().replace(/[&\/\\#, +()$~%.'":*?<>{}^\[\]\|]/g, '\\$&')
        : (sendEmptyString ? '' : text);
};
exports.replaceSpecialChars = replaceSpecialChars;
exports.messageType = {
    MESSAGE: "message",
    ENQUIRY: "enquiry"
};
exports.messageTypeConstant = Object.values(exports.messageType);
exports.notificationConfigConstant = {
    orderCreationSMS: true,
    orderCreationWhatsapp: false,
    orderUpdateSMS: true,
    orderUpdateWhatsapp: false,
};
//# sourceMappingURL=constants.js.map