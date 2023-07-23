"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverySchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the Delivery Schema
exports.DeliverySchema = new Database_1.default.Schema({
    companyId: { type: mongoose_1.Types.ObjectId, ref: "Company" },
    deliveryZone: { type: String },
    pincode: [{ type: String }],
    deliveryFee: { type: String },
    flatFeeType: { type: String },
    flatFeeAmount: { type: Number },
    customAmount: [{
            min: {
                type: Number
            },
            max: {
                type: Number
            },
            deliveryCharge: {
                type: Number
            }
        }],
    selfPickup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
const Delivery = Database_1.default.model("Delivery", exports.DeliverySchema);
exports.default = Delivery;
//# sourceMappingURL=delivery.js.map