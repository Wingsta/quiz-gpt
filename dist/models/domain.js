"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainSchema = void 0;
const Database_1 = require("../providers/Database");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.DomainSchema = new Database_1.default.Schema({
    name: { type: String },
    companyId: { type: Database_1.default.Schema.Types.ObjectId },
    metaData: { type: Object },
    published: { type: Boolean, default: false }
}, {
    timestamps: true,
});
const Domain = Database_1.default.model("Domain", exports.DomainSchema);
exports.default = Domain;
//# sourceMappingURL=domain.js.map