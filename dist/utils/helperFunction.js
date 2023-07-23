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
exports.checkNotification = void 0;
const configuration_1 = require("../models/configuration");
const constants_1 = require("./constants");
const checkNotification = (companyId, key, returnAll = false) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let notificationConfig = {};
        notificationConfig = yield configuration_1.default.findOne({
            companyId,
            type: constants_1.configurationTypes.NOTIFICATION
        });
        notificationConfig = (notificationConfig === null || notificationConfig === void 0 ? void 0 : notificationConfig.data) || {};
        notificationConfig = Object.assign(Object.assign({}, constants_1.notificationConfigConstant), notificationConfig);
        if (returnAll) {
            return notificationConfig;
        }
        return notificationConfig[key] ? true : false;
    }
    catch (e) {
        if (returnAll) {
            return constants_1.notificationConfigConstant;
        }
        return false;
    }
});
exports.checkNotification = checkNotification;
//# sourceMappingURL=helperFunction.js.map