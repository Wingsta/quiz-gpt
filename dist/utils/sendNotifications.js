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
exports.sendMessage = void 0;
const company_1 = require("../models/company");
const helperFunction_1 = require("./helperFunction");
const whatsapp_1 = require("./whatsapp");
function sendMessage(companyId, userId, key, phoneNumber, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const hasPermission = yield (0, helperFunction_1.checkNotification)(companyId, key);
        //   if (!hasPermission) {
        //     console.log("Company does not have permission to send message");
        //     return;
        //   }
        switch (key) {
            case "orderCreationWhatsapp":
                // Call API to send message using key1
                yield (0, whatsapp_1.sendWhatsAppMessage)(phoneNumber, "", companyId, userId);
                yield incrementWhatsapp(companyId);
                break;
            case "key2":
                // Call API to send message using key2
                break;
            case "orderUpdateWhatsapp":
                yield (0, whatsapp_1.sendWhatsAppMessage)(phoneNumber, "", companyId, userId);
                yield incrementWhatsapp(companyId);
                break;
            default:
                console.log("Invalid key");
        }
        //   await incrementSMS(companyId);
    });
}
exports.sendMessage = sendMessage;
function incrementSMS(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield company_1.default.updateOne({ _id: companyId }, { $inc: { "sms.totalUsed": 0.25 } }, {
            upsert: true,
        });
    });
}
function incrementWhatsapp(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield company_1.default.updateOne({ _id: companyId }, { $inc: { "whatsapp.totalUsed": 0.25 } }, {
            upsert: true,
        });
    });
}
//# sourceMappingURL=sendNotifications.js.map