"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSchema = void 0;
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
    landmark: { type: String },
    default: { type: Boolean, default: false },
    country: { type: String, default: "India" },
});
// Define the Profile Schema
exports.ProfileSchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    mobile: { type: String },
    name: { type: String },
    email: { type: String },
    otp: { type: Number },
    address: [Address],
    verified: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const Profile = Database_1.default.model("Profile", exports.ProfileSchema);
exports.default = Profile;
//# sourceMappingURL=profile.js.map