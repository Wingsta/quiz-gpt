"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
const productSchema = new Database_1.default.Schema({
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product" },
    count: { type: Number },
    purchasePrice: { type: Number },
    skuId: { type: String },
    variantSKUId: { type: String },
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
exports.InventorySchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    userId: { type: mongoose_1.Types.ObjectId, ref: "AccountUser" },
    customerName: { type: String },
    address: { type: String },
    gstin: { type: String },
    invoice: { type: String },
    total: { type: Number },
    contactPersonName: { type: String },
    contactPersonNumber: { type: String },
    purchaseDate: { type: Date },
    products: [productSchema],
    status: {
        type: String,
    },
    notes: { type: String },
    invoiceNumber: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, {
    timestamps: true,
});
const Iventory = Database_1.default.model("Inventory", exports.InventorySchema);
exports.default = Iventory;
//# sourceMappingURL=inventory.js.map