"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the Message Schema
exports.MessageSchema = new Database_1.default.Schema({
    message: { type: String },
    userId: { type: mongoose_1.Types.ObjectId, ref: "Profile" },
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product" },
    type: { type: String },
    productDetails: {
        type: mongoose_1.Schema.Types.Mixed,
        default: () => ({}),
    }
}, {
    timestamps: true,
});
const Message = Database_1.default.model("Message", exports.MessageSchema);
exports.default = Message;
//# sourceMappingURL=message.js.map