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
exports.getScreenShot = void 0;
const { Client, LocalAuth } = require("whatsapp-web.js");
const getScreenShot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new Client({ authStrategy: new LocalAuth() });
        client.on("qr", (qr) => {
            // Generate and scan this code with your phone
            console.log("QR RECEIVED", qr);
        });
        client.on("authenticated", () => {
            console.log("AUTHENTICATED");
        });
        client.on("auth_failure", (msg) => {
            // Fired if session restore was unsuccessful
            console.error("AUTHENTICATION FAILURE", msg);
        });
        client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("READY");
            let k = yield client.getNumberId("8056063139");
            client.sendMessage(k._serialized, "hello");
            console.log(k);
        }));
        client.initialize();
        //    const browser = await puppeteer.launch({
        //      puppeteer: {
        //        headless: true,
        //        defaultViewport: null,
        //      },
        //      authTimeoutMs: 0,
        //      qrMaxRetries: 0,
        //      takeoverOnConflict: false,
        //      takeoverTimeoutMs: 0,
        //      userAgent:
        //        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
        //      ffmpegPath: "ffmpeg",
        //      bypassCSP: false,
        //    });
        //    const page = await browser.newPage();
        //    await page.setUserAgent(
        //      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
        //    );
        //    await page.setViewport({ width: 1280, height: 720 });
        //    const website_url = "https://web.whatsapp.com/";
        //    // Open URL in current page
        //    await page.goto(website_url, {
        //      waitUntil: "load",
        //      timeout: 0,
        //      referer: "https://whatsapp.com/",
        //    });
        //     // await page.setDefaultTimeout(0);
        // // 
        //     await page.waitForSelector("div[data-ref] canvas");
        //     // const element = await page.$('div[data-testid="qrcode"]');
        //     // console.log(element)
        //     let im = await page.screenshot({
        //       path: `./images/post_image.jpg`,
        //     });
        //     console.log(im)
        res.json({ complete: "completed" });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getScreenShot = getScreenShot;
//# sourceMappingURL=pupeeter.js.map