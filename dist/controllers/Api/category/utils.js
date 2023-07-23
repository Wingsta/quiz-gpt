"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDuplicateCategory = exports.validateCategory = void 0;
const Joi = require("joi");
const validateCategory = (input) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        isActive: Joi.boolean().required()
    });
    return schema.validate(input);
};
exports.validateCategory = validateCategory;
const validateDuplicateCategory = (input) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        editId: Joi.string().allow(null, '').optional(),
    });
    return schema.validate(input);
};
exports.validateDuplicateCategory = validateDuplicateCategory;
//# sourceMappingURL=utils.js.map