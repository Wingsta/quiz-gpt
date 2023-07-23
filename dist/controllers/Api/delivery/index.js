"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendresponse_1 = require("../../../services/response/sendresponse");
const delivery_1 = require("../../../models/delivery");
const utils_1 = require("./utils");
class DeliverySettings {
    static getDeliverySettings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                const data = yield delivery_1.default.findOne({ companyId });
                return res.json((0, sendresponse_1.sendSuccessResponse)(data, "Delivery settings!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static saveDeliverySettings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateDeliverySetting)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { deliveryZone, pincode, deliveryFee, flatFeeType, flatFeeAmount, customAmount, selfPickup } = req.body;
                yield delivery_1.default.findOneAndUpdate({
                    companyId
                }, {
                    companyId,
                    deliveryZone,
                    pincode,
                    deliveryFee,
                    flatFeeType,
                    flatFeeAmount,
                    customAmount,
                    selfPickup
                }, { upsert: true });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Delivery settings updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = DeliverySettings;
//# sourceMappingURL=index.js.map