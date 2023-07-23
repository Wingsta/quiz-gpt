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
exports.sendEmail = void 0;
let nodemailer = require("nodemailer");
const Email = require("email-templates");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../../.env') });
let transport;
const host = process.env.EMAIL_host;
const port = process.env.EMAIL_port;
const username = process.env.EMAIL_username;
const password = process.env.EMAIL_password;
transport = {
    host,
    port,
    secure: +port === 465 ? true : false,
    auth: {
        user: username,
        pass: password
    }
};
let transporter = nodemailer.createTransport(transport);
const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
});
const sendEmail = function (template, to, locals, bcc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield email.send({
                template,
                message: {
                    from: "noreply@sociallink.one",
                    to,
                    bcc
                },
                locals
            });
            console.log("email has been sent!");
        }
        catch (error) {
            console.log('Error sending email', error);
        }
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map