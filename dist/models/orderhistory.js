"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderHistorySchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Define the Profile Schema
exports.OrderHistorySchema = new Database_1.default.Schema({
    orderId: { type: mongoose_1.Types.ObjectId, ref: "Order" },
    status: { type: String },
    message: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, {
    timestamps: true,
});
const OrderHistory = Database_1.default.model("OrderHistory", exports.OrderHistorySchema);
exports.default = OrderHistory;
//# sourceMappingURL=orderhistory.js.map