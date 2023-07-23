"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUserSchema = void 0;
const Database_1 = require("../providers/Database");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.TestUserSchema = new Database_1.default.Schema({
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    testCount: { type: Number },
}, {
    timestamps: true,
});
const TestUser = Database_1.default.model("TestUser", exports.TestUserSchema);
exports.default = TestUser;
//# sourceMappingURL=testuser.js.map