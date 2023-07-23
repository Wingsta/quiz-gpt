"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostalCodeSchema = void 0;
const Database_1 = require("../providers/Database");
// Create the model schema & register your custom methods here
// Define the Postalcode Schema
exports.PostalCodeSchema = new Database_1.default.Schema({
    officeName: { type: String },
    pincode: {
        type: Number,
        index: true
    },
    officeType: {
        type: String,
        index: true
    },
    deliveryStatus: { type: String },
    divisionName: { type: String },
    regionName: { type: String },
    circleName: { type: String },
    taluk: {
        type: String,
        index: true
    },
    districtName: {
        type: String,
        index: true
    },
    stateName: {
        type: String,
        index: true
    },
    country: {
        type: String,
        default: "India"
    },
    countryCode: {
        type: String,
        default: "IN"
    },
}, {
    timestamps: true,
});
const PostalCode = Database_1.default.model("PostalCode", exports.PostalCodeSchema);
exports.default = PostalCode;
//# sourceMappingURL=postalCode.js.map