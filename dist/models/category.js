"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the Message Schema
exports.CategorySchema = new Database_1.default.Schema({
    name: { type: String },
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: null }
}, {
    timestamps: true,
});
const Category = Database_1.default.model("Category", exports.CategorySchema);
exports.default = Category;
//# sourceMappingURL=category.js.map