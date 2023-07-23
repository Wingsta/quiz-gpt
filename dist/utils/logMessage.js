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
exports.logMessage = void 0;
const messagelogs_1 = require("../models/messagelogs");
function logMessage(type, message, phoneNumber, creditsUsed, actualSpent, companyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageLog = new messagelogs_1.default({
            type,
            message,
            phoneNumber,
            creditsUsed,
            actualSpent,
        });
        yield messageLog.save();
    });
}
exports.logMessage = logMessage;
//# sourceMappingURL=logMessage.js.map