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
exports.sendWhatsAppMessage = void 0;
const axios_1 = require("axios");
const logMessage_1 = require("./logMessage");
function sendWhatsAppMessage(phoneNumber, message, companyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://api.gupshup.io/sm/api/v1/msg";
        const apiKey = "uy12ftzglolkkf6birwyahzfvv9h7ffi";
        const channel = "917834811114";
        const config = {
            headers: {
                "Cache-Control": "no-cache",
                "Content-Type": "application/x-www-form-urlencoded",
                apikey: apiKey,
            },
        };
        const data = {
            channel: "whatsapp",
            source: channel,
            destination: "918667300544",
            message: JSON.stringify({
                type: "text",
                text: "Download your {{1}} ticket from the link given below. | [Visit Website,https://www.gupshup.io/developer/{{1}}]",
            }),
            "src.name": "sociallink",
        };
        const obj = data;
        const encodedString = Object.entries(obj)
            .map(([key, val]) => {
            console.log(key, val);
            return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        })
            .join("&");
        console.log(encodedString);
        try {
            const response = yield axios_1.default.post(url, encodedString, config);
            console.log(response);
            yield (0, logMessage_1.logMessage)("WHATSAPP", message, phoneNumber, "0.25", "0.1", companyId, userId);
            console.log("Message sent successfully");
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendWhatsAppMessage = sendWhatsAppMessage;
//# sourceMappingURL=whatsapp.js.map