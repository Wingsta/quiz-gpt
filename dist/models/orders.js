"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
const Address = new mongoose_1.Schema({
    name: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
});
const OrderProducts = new mongoose_1.Schema({
    name: { type: String },
    sku: { type: String },
    quantity: { type: String },
    thumbnail: { type: String },
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product" },
    price: { type: Number },
    variantSKU: { type: String },
    size: {
        label: {
            type: String,
        },
        value: {
            type: String,
        },
        alias: {
            type: String,
        },
    },
    color: {
        label: {
            type: String,
        },
        value: {
            type: String,
        },
        alias: {
            type: String,
        },
    },
});
// Define the Profile Schema
exports.OrderSchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    products: [OrderProducts],
    orderId: { type: String },
    orderNumber: { type: Number },
    userId: { type: mongoose_1.Types.ObjectId, ref: "Profile" },
    status: { type: String },
    deliveryAddress: Address,
    total: { type: Number },
    tax: { type: Number },
    delivery: {
        type: Number,
        default: 0,
    },
    totalAfterTax: { type: Number },
    paymentMethod: { type: String },
    mode: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    returnData: { type: Database_1.default.Schema.Types.Mixed },
    selfPickup: {
        type: Boolean,
        default: false,
    },
    offline: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Order = Database_1.default.model("Order", exports.OrderSchema);
exports.default = Order;
//# sourceMappingURL=orders.js.map