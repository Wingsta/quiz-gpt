"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeliverySetting = void 0;
const Joi = require("joi");
const constants_1 = require("../../../utils/constants");
const validateDeliverySetting = (input) => {
    const customAmount = Joi.object({
        min: Joi.number().required(),
        max: Joi.number().allow("", null).required(),
        deliveryCharge: Joi.number().required()
    });
    const schema = Joi.object({
        deliveryZone: Joi.string().valid(...Object.values(constants_1.deliveryZoneConstants)).required(),
        pincode: Joi.array().items(Joi.string().optional()).required(),
        deliveryFee: Joi.string().valid(...Object.values(constants_1.deliveryFeeConstants)).required(),
        flatFeeType: Joi.string().allow("", null).valid(...Object.values(constants_1.deliveryFlatFeeConstants)).required(),
        flatFeeAmount: Joi.number().allow("", null).required(),
        customAmount: Joi.array().items(customAmount).required(),
        selfPickup: Joi.boolean().required()
    });
    return schema.validate(input);
};
exports.validateDeliverySetting = validateDeliverySetting;
//# sourceMappingURL=utils.js.map