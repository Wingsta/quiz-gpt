"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMessage = void 0;
const Joi = require("joi");
const constants_1 = require("../../../utils/constants");
const validateMessage = (input) => {
    let message = {
        name: Joi.string().required(),
        mobile: Joi.string().min(13).max(13).required(),
        message: Joi.string().max(1000).required(),
        type: Joi.string().valid(...constants_1.messageTypeConstant).required(),
    };
    if ((input === null || input === void 0 ? void 0 : input.type) === constants_1.messageType.ENQUIRY) {
        message.productId = Joi.string().required();
        message.productDetails = Joi.object().required();
    }
    const schema = Joi.object(message);
    return schema.validate(input);
};
exports.validateMessage = validateMessage;
//# sourceMappingURL=utils.js.map