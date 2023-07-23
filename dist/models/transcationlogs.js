"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscationLogsSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
const transactionStatus = [
    "CREATED",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
    "PROCESSING",
];
const transactionStatusConstant = ["IN", "OUT", "REFUND"];
const transactionGateway = ["RAZORPAY"];
// Define the User Schema
exports.TranscationLogsSchema = new Database_1.default.Schema({
    companyId: { type: Database_1.default.Schema.Types.ObjectId, ref: "Company" },
    userId: { type: Database_1.default.Schema.Types.ObjectId, ref: "AccountUser" },
    status: {
        type: String,
        enum: transactionStatus,
        default: "CREATED",
    },
    razorpayPaymentId: {
        type: String,
    },
    returnData: {
        type: mongoose_1.Schema.Types.Mixed,
        default: () => ({}),
    },
    item: {
        type: mongoose_1.Schema.Types.Mixed,
        default: () => [],
    },
    totalAmount: {
        type: Number,
    },
    transactionStatus: {
        type: String,
        enum: transactionStatusConstant,
        default: "IN",
    },
    gateway: {
        type: String,
        enum: transactionGateway,
    },
    mode: {
        type: String,
    },
    orderId: {
        type: String,
    },
}, {
    timestamps: true,
});
const TranscationLogs = Database_1.default.model("TranscationLog", exports.TranscationLogsSchema);
exports.default = TranscationLogs;
//# sourceMappingURL=transcationlogs.js.map