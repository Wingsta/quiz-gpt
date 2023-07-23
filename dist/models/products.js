"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.VariantSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
exports.VariantSchema = new Database_1.default.Schema({
    sku: {
        type: String,
    },
    price: {
        type: Number,
    },
    originalPrice: {
        type: Number,
    },
    thumbnail: { type: String },
    quantity: {
        type: Number,
    },
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
    outOfStock: {
        type: Boolean,
        default: false,
    },
});
// Define the User Schema
exports.ProductSchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    name: { type: String },
    price: { type: Number },
    status: { type: Number },
    sku: { type: String },
    slug: { type: String },
    quantity: { type: Number },
    addedDate: { type: Date },
    thumbnail: { type: String },
    carouselImages: { type: Array },
    categoryId: { type: mongoose_1.Types.ObjectId, ref: "Category" },
    posts: [{ type: mongoose_1.Types.ObjectId, ref: "Post" }],
    productVersion: { type: String },
    originalPrice: { type: Number },
    description: { type: String },
    productUnitCount: { type: Number },
    productUnitLabel: { type: String },
    variants: [exports.VariantSchema],
    createdAt: { type: Date },
    updatedAt: { type: Date },
    enquiry: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
const Product = Database_1.default.model("Product", exports.ProductSchema);
exports.default = Product;
//# sourceMappingURL=products.js.map