"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationConfiguration = exports.validatePrivacyPolicy = exports.validateTermsAndCondition = void 0;
const Joi = require("joi");
const validateTermsAndCondition = (input) => {
    const schema = Joi.object({
        // type: Joi.string().valid(...Object.values(configurationTypes)).required(),
        data: Joi.any(),
        termsAndConditions: Joi.boolean()
    });
    return schema.validate(input);
};
exports.validateTermsAndCondition = validateTermsAndCondition;
const validatePrivacyPolicy = (input) => {
    const schema = Joi.object({
        // type: Joi.string().valid(...Object.values(configurationTypes)).required(),
        data: Joi.any(),
        privacyPolicy: Joi.boolean()
    });
    return schema.validate(input);
};
exports.validatePrivacyPolicy = validatePrivacyPolicy;
const validateNotificationConfiguration = (input) => {
    const schema = Joi.object({
        data: Joi.any()
    });
    return schema.validate(input);
};
exports.validateNotificationConfiguration = validateNotificationConfiguration;
//# sourceMappingURL=utils.js.map