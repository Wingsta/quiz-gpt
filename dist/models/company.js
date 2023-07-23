"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.CompanySchema = new Database_1.default.Schema({
    companyName: { type: String },
    meta: {
        buisnessAccountData: { type: Object },
        buisnessAccountId: { type: String },
        fbPageId: { type: String },
        subscriptions: { type: Object },
        fbPageAccessToken: { type: String },
        accessToken: { type: String },
        domainName: { type: String },
        domainId: { type: mongoose_1.Types.ObjectId, ref: "Domain" },
    },
    razorpayAppId: { type: String },
    razorpaySecretKey: { type: String },
    promoCode: { type: String },
    sms: { type: mongoose_1.Schema.Types.Mixed },
    whatsapp: { type: mongoose_1.Schema.Types.Mixed },
}, {
    timestamps: true,
});
const Company = Database_1.default.model("Company", exports.CompanySchema);
exports.default = Company;
//# sourceMappingURL=company.js.map