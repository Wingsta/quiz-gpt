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
const sendresponse_1 = require("../../../services/response/sendresponse");
const postalCode_1 = require("../../../models/postalCode");
const utils_1 = require("./utils");
class PostalCodes {
    static getPostalCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validatePostalcode)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { type, data } = req.body;
                data = new RegExp(data, "i");
                let postalData = [];
                if (type === "PINCODE") {
                    postalData = yield postalCode_1.default.find({
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$pincode" },
                                regex: data
                            }
                        }
                    }).sort({ officeName: 1 }).skip(0).limit(25);
                }
                else if (type === "ZONE") {
                    // postalData = await PostalCode.find({
                    //     $or: [
                    //         { officeName: data },
                    //         { taluk: data },
                    //         { districtName: data },
                    //         { stateName: data }
                    //     ]
                    // }).sort({ officeName: 1 });
                    postalData = yield postalCode_1.default.aggregate([
                        {
                            $match: {
                                districtName: data
                            }
                        },
                        {
                            $project: {
                                districtName: 1,
                                pincode: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$districtName",
                                data: { $push: "$$ROOT" }
                            }
                        },
                    ]);
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(postalData, "Postal code data!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = PostalCodes;
//# sourceMappingURL=index.js.map