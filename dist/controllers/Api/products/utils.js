"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProduct = void 0;
const Joi = require("joi");
const validateProduct = (input) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        isActive: Joi.boolean().required(),
        editId: Joi.string().allow(null, '').optional(),
    });
    return schema.validate(input);
};
exports.validateProduct = validateProduct;
//# sourceMappingURL=utils.js.map