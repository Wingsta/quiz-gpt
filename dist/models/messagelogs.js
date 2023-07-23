"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageLogsSchema = void 0;
const Database_1 = require("../providers/Database");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.MessageLogsSchema = new Database_1.default.Schema({
    type: { type: String, enum: ["SMS", "WHATSAPP"] },
    message: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    creditsUsed: {
        type: String,
    },
    actualSpent: {
        type: String,
    },
    companyId: { type: Database_1.default.Schema.Types.ObjectId, ref: "Company" },
    userId: { type: Database_1.default.Schema.Types.ObjectId, ref: "AccountUser" },
}, {
    timestamps: true,
});
const MessageLogs = Database_1.default.model("MessageLog", exports.MessageLogsSchema);
exports.default = MessageLogs;
//# sourceMappingURL=messagelogs.js.map