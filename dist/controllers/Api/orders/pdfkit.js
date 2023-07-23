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
exports.createInvoice = void 0;
const PDFDocument = require("pdfkit");
const axios_1 = require("axios");
const getStream = require("get-stream");
function fetchImage(src) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = yield axios_1.default.get(src, {
            responseType: "arraybuffer",
        });
        //   console.log(image)
        return image.data;
    });
}
function createInvoice(invoice) {
    return __awaiter(this, void 0, void 0, function* () {
        let doc = new PDFDocument({ size: "A4", margin: 50 });
        doc.registerFont("Roboto", __dirname + "/Roboto-Regular.ttf");
        yield generateHeader(doc, invoice);
        yield generateCustomerInformation(doc, invoice);
        yield generateInvoiceTable(doc, invoice);
        yield generateFooter(doc);
        doc.end();
        const pdfStream = yield getStream.buffer(doc);
        return pdfStream;
    });
}
exports.createInvoice = createInvoice;
function generateHeader(doc, invoice) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        let x = 50;
        console.log(invoice === null || invoice === void 0 ? void 0 : invoice.logo);
        if (invoice === null || invoice === void 0 ? void 0 : invoice.logo) {
            const logo = yield fetchImage(invoice === null || invoice === void 0 ? void 0 : invoice.logo);
            yield doc.image(logo, 50, 45, { width: 50 });
            x = x + 60;
        }
        yield doc
            .fillColor("#444444")
            .fontSize(20)
            .text((_a = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _a === void 0 ? void 0 : _a.name, x, 57)
            .fontSize(10)
            .text((_b = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _b === void 0 ? void 0 : _b.address, 200, 65, {
            align: "right",
        })
            .text((_c = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _c === void 0 ? void 0 : _c.addressLine2, 200, 80, {
            align: "right",
        })
            .text((((_d = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _d === void 0 ? void 0 : _d.city) || " ") +
            `${((_e = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _e === void 0 ? void 0 : _e.city) ? ", " : ""}` +
            (((_f = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _f === void 0 ? void 0 : _f.postal_code) || ""), 200, 95, {
            align: "right",
        })
            .text((((_g = invoice === null || invoice === void 0 ? void 0 : invoice.storeAddress) === null || _g === void 0 ? void 0 : _g.state) || " "), 200, 110, {
            align: "right",
        })
            .moveDown();
    });
}
function generateCustomerInformation(doc, invoice) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        yield doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 140);
        yield generateHr(doc, 165);
        const customerInformationTop = 180;
        yield doc
            .fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold")
            .text(invoice.invoice_nr, 150, customerInformationTop)
            .font("Helvetica")
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(formatDate(new Date()), 150, customerInformationTop + 15)
            .text("Total Amount:", 50, customerInformationTop + 30)
            .font("Roboto")
            .text(formatCurrency(invoice.subtotal - invoice.paid), 150, customerInformationTop + 30)
            .font("Helvetica-Bold")
            .text(((_a = invoice.shipping) === null || _a === void 0 ? void 0 : _a.name) || "", 300, customerInformationTop)
            .font("Helvetica")
            .text(((_b = invoice.shipping) === null || _b === void 0 ? void 0 : _b.mobile) || "", 300, customerInformationTop + 15);
        if (invoice.shipping.address) {
            yield doc
                .text(invoice.shipping.address, 300, customerInformationTop + 30)
                .text((_c = invoice === null || invoice === void 0 ? void 0 : invoice.shipping) === null || _c === void 0 ? void 0 : _c.addressLine2, 300, customerInformationTop + 45)
                .text((invoice.shipping.city || " ") +
                `${invoice.shipping.city ? ", " : ""}` +
                (invoice.shipping.postal_code || ""), 300, customerInformationTop + 60)
                .text(invoice.shipping.state || " ", 300, customerInformationTop + 75)
                .moveDown();
            yield generateHr(doc, customerInformationTop + 90);
        }
        else
            yield generateHr(doc, customerInformationTop + 50);
    });
}
function generateInvoiceTable(doc, invoice) {
    return __awaiter(this, void 0, void 0, function* () {
        let i;
        let invoiceTableTop = 330;
        if (!invoice.shipping.address) {
            invoiceTableTop = 270;
        }
        yield doc.font("Helvetica-Bold");
        yield generateTableRow(doc, invoiceTableTop, "Item", "Description", "Unit Cost", "Quantity", "Line Total");
        yield generateHr(doc, invoiceTableTop + 20);
        yield doc.font("Helvetica");
        for (i = 0; i < invoice.items.length; i++) {
            const item = invoice.items[i];
            const position = invoiceTableTop + (i + 1) * 30;
            yield generateTableRow(doc, position, item.item, item.description, formatCurrency(item.amount / item.quantity), item.quantity, formatCurrency(item.amount));
            yield generateHr(doc, position + 20);
        }
        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        yield generateTableRow(doc, subtotalPosition, "", "", "Subtotal", "", formatCurrency(invoice.subtotal));
        const paidToDatePosition = subtotalPosition + 20;
        yield generateTableRow(doc, paidToDatePosition, "", "", "", "", "");
        const duePosition = paidToDatePosition + 25;
        yield doc.font("Helvetica-Bold");
        yield generateTableRow(doc, duePosition, "", "", "Total Amount", "", formatCurrency(invoice.subtotal - invoice.paid));
        yield doc.font("Helvetica");
    });
}
function generateFooter(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        doc
            .fontSize(10)
            .text("This is a computer generated invoice.", 50, 780, { align: "center", width: 500 });
    });
}
function generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
    return __awaiter(this, void 0, void 0, function* () {
        yield doc
            .font("Roboto")
            .fontSize(10)
            .text(item, 50, y)
            .text(unitCost, 280, y, { width: 90, align: "right" })
            .text(quantity, 370, y, { width: 90, align: "right" })
            .text(lineTotal, 0, y, { align: "right" })
            .font("Helvetica");
    });
}
function generateHr(doc, y) {
    return __awaiter(this, void 0, void 0, function* () {
        yield doc
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    });
}
function formatCurrency(cents) {
    return "\u20B9" + (parseFloat(cents)).toFixed(2);
}
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + "/" + month + "/" + day;
}
//# sourceMappingURL=pdfkit.js.map