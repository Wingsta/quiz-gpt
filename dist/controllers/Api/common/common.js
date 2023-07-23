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
exports.calculateDeliveryCharge = exports.updateCategoryProduct = void 0;
const category_1 = require("../../../models/category");
const products_1 = require("../../../models/products");
const delivery_1 = require("../../../models/delivery");
const constants_1 = require("../../../utils/constants");
const updateCategoryProduct = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let productCount = yield products_1.default.countDocuments({
            categoryId
        });
        yield category_1.default.findByIdAndUpdate(categoryId, { productCount });
    }
    catch (error) {
    }
});
exports.updateCategoryProduct = updateCategoryProduct;
const calculateDeliveryCharge = (companyId, orderAmount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let data = yield delivery_1.default.findOne({ companyId });
        let deliveryCost = 0, pincode = [], selfPickup = false;
        if (!data) {
            return {
                enableSelfPickup: selfPickup,
                pincode,
                deliveryCost
            };
        }
        if ((data === null || data === void 0 ? void 0 : data.deliveryZone) === constants_1.deliveryZoneConstants.ADVANCED) {
            pincode = data === null || data === void 0 ? void 0 : data.pincode;
        }
        if ((data === null || data === void 0 ? void 0 : data.deliveryFee) === constants_1.deliveryFeeConstants.FLAT) {
            if ((data === null || data === void 0 ? void 0 : data.flatFeeType) === constants_1.deliveryFlatFeeConstants.AMOUNT) {
                deliveryCost = (data === null || data === void 0 ? void 0 : data.flatFeeAmount) || 0;
            }
            if ((data === null || data === void 0 ? void 0 : data.flatFeeType) === constants_1.deliveryFlatFeeConstants.PERCENTAGE) {
                if (data === null || data === void 0 ? void 0 : data.flatFeeAmount) {
                    deliveryCost = ((orderAmount * (data === null || data === void 0 ? void 0 : data.flatFeeAmount)) / 100);
                }
            }
        }
        if ((data === null || data === void 0 ? void 0 : data.deliveryFee) === constants_1.deliveryFeeConstants.CUSTOM) {
            let i;
            for (i = 0; i < (data === null || data === void 0 ? void 0 : data.customAmount.length); i++) {
                if (i === (data === null || data === void 0 ? void 0 : data.customAmount.length) - 1) {
                    deliveryCost = (_a = data === null || data === void 0 ? void 0 : data.customAmount[i]) === null || _a === void 0 ? void 0 : _a.deliveryCharge;
                    break;
                }
                if (orderAmount <= (data === null || data === void 0 ? void 0 : data.customAmount[i].max) && orderAmount >= (data === null || data === void 0 ? void 0 : data.customAmount[i].min)) {
                    deliveryCost = (_b = data === null || data === void 0 ? void 0 : data.customAmount[i]) === null || _b === void 0 ? void 0 : _b.deliveryCharge;
                    break;
                }
            }
        }
        selfPickup = data === null || data === void 0 ? void 0 : data.selfPickup;
        return {
            enableSelfPickup: selfPickup,
            pincode,
            deliveryCost
        };
    }
    catch (error) {
        return {
            enableSelfPickup: false,
            pincode: [],
            deliveryCost: 0
        };
    }
});
exports.calculateDeliveryCharge = calculateDeliveryCharge;
//# sourceMappingURL=common.js.map