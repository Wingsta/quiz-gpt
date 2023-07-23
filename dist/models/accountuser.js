"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountUserSchema = void 0;
const Database_1 = require("../providers/Database");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.AccountUserSchema = new Database_1.default.Schema({
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    status: { type: String }
}, {
    timestamps: true,
});
const AccountUser = Database_1.default.model("AccountUser", exports.AccountUserSchema);
exports.default = AccountUser;
//# sourceMappingURL=accountuser.js.map