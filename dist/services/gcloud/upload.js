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
exports.uploadImageForSocialLink = exports.uploadImage = exports.compressImages = void 0;
const util = require("util");
const gc = require("./index");
const bucket = gc.bucket("insta-pilot-beta.appspot.com"); // should be your bucket name
const sharp = require("sharp");
/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */
function compressImages() {
    return __awaiter(this, void 0, void 0, function* () {
        // Replace with your own project ID and key file path
        let bucketName = "insta-pilot-beta.appspot.com";
        let [files] = yield bucket.getFiles({
            prefix: `63eb60993ccb570011bd67fd/`,
        });
        console.log(files.length);
        files = files.filter((it) => it.metadata.contentType.startsWith("image/webp"));
        console.log(files.length);
        for (const file of files) {
            // continue
            try {
                const metadata = yield file.metadata;
                console.log(metadata === null || metadata === void 0 ? void 0 : metadata.contentType, metadata === null || metadata === void 0 ? void 0 : metadata.size);
                if (metadata.contentType.startsWith("image/webp") &&
                    parseInt(metadata === null || metadata === void 0 ? void 0 : metadata.size) > 317776) {
                    try {
                        const stream = file.createReadStream();
                        const resizedStream = stream.pipe(sharp().resize(600, 600, {
                            fit: "contain",
                            background: { r: 255, g: 255, b: 255, alpha: 0.0 },
                        }));
                        const newFile = gc.bucket(bucketName).file(`${metadata === null || metadata === void 0 ? void 0 : metadata.name}`);
                        const writeStream = newFile.createWriteStream();
                        resizedStream.pipe(writeStream);
                        yield new Promise((resolve, reject) => {
                            writeStream.on("error", reject);
                            writeStream.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                                let k = yield newFile.makePublic();
                                resolve();
                            }));
                        });
                        console.log(`${file.name} compressed and saved as ${newFile.name}`);
                    }
                    catch (errrr) {
                        console.log(`${file.name} is not an image errrrr`);
                    }
                }
                else {
                    console.log(`${file.name} is not an image`);
                }
            }
            catch (err) {
                console.error(`Error compressing ${file.name}: ${err}`);
            }
        }
    });
}
exports.compressImages = compressImages;
const uploadImage = (file, company) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file;
    const blob = bucket.file(`${company}/${originalname}`.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false,
    });
    blobStream
        .on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
        let k = yield blob.makePublic();
        console.log(k, "hellpp");
        console.log(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
    }))
        .on("error", (error) => {
        console.log(error);
        reject(`Unable to upload image, something went wrong`);
    })
        .end(buffer);
});
exports.uploadImage = uploadImage;
/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */
const uploadImageForSocialLink = (file, company) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file;
    const blob = bucket.file(`sociallink/${originalname}`.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false,
    });
    blobStream
        .on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
        let k = yield blob.makePublic();
        console.log(k, "hellpp");
        console.log(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
    }))
        .on("error", (error) => {
        console.log(error);
        reject(`Unable to upload image, something went wrong`);
    })
        .end(buffer);
});
exports.uploadImageForSocialLink = uploadImageForSocialLink;
//# sourceMappingURL=upload.js.map