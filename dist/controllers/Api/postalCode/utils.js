"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePostalcode = void 0;
const Joi = require("joi");
const validatePostalcode = (input) => {
    const schema = Joi.object({
        type: Joi.string().valid(...["PINCODE", "ZONE"]).required(),
        data: Joi.string().required()
    });
    return schema.validate(input);
};
exports.validatePostalcode = validatePostalcode;
//# sourceMappingURL=utils.js.map