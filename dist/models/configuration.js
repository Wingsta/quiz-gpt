"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
const constants_1 = require("../utils/constants");
// Create the model schema & register your custom methods here
// Define the Configuration Schema
exports.ConfigurationSchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    type: {
        type: String,
        enum: Object.keys(constants_1.configurationTypes)
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        default: () => ({}),
    },
}, {
    timestamps: true,
});
const Configuration = Database_1.default.model("Configuration", exports.ConfigurationSchema);
exports.default = Configuration;
//# sourceMappingURL=configuration.js.map