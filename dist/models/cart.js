"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the Profile Schema
exports.CartSchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    mobile: { type: String },
    sku: { type: String },
    name: { type: String },
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product" },
    userId: { type: mongoose_1.Types.ObjectId, ref: "Profile" },
    quantity: { type: Number },
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
}, {
    timestamps: true,
});
const Cart = Database_1.default.model("Cart", exports.CartSchema);
exports.default = Cart;
//# sourceMappingURL=cart.js.map