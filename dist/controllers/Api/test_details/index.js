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
const mongodb_1 = require("mongodb");
const testresult_1 = require("../../../models/testresult");
const sendresponse_1 = require("../../../services/response/sendresponse");
const test_details_1 = require("../../../models/test_details");
const moment = require("moment");
const constants_1 = require("../../../utils/constants");
class ProfileController {
    static getTestDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let { limit = 10, offset = 0, startDate, endDate, sortBy = "createdAt", sortType = "desc", status, searchTerm, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = {
                    accountUser: new mongodb_1.ObjectId(accountId),
                };
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (startDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery["$and"].push({
                        createdAt: {
                            $gte: moment(startDate).startOf("day").toDate(),
                        },
                    });
                }
                if (endDate) {
                    if (!mongoQuery["$and"]) {
                        mongoQuery["$and"] = [];
                    }
                    mongoQuery["$and"].push({
                        createdAt: {
                            $lte: moment(endDate).endOf("day").toDate(),
                        },
                    });
                }
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { prompt: new RegExp(searchTerm, "i") },
                        { title: new RegExp(searchTerm, "i") },
                        { description: new RegExp(searchTerm, "i") },
                    ];
                }
                let testDetails = yield test_details_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    // .populate("userId")
                    .lean();
                let count = yield test_details_1.default.count(mongoQuery);
                if (testDetails) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        testDetails: testDetails,
                        count,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getTestDetailsCount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let testDetails = yield test_details_1.default.count({
                    accountUser: new mongodb_1.ObjectId(id),
                });
                if (testDetails !== undefined) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        count: testDetails,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOneTestDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let { testDetailsId } = req.params;
                if (!testDetailsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testDetailsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestDetails = yield test_details_1.default.findOne({
                    _id: testDetailsId,
                });
                if (!savedTestDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testDetails not found"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testDetails: savedTestDetails }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOneTestDetailsPublic(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { testUserId } = req.user || {};
                let { testDetailsId } = req.params;
                if (!testDetailsId || !mongodb_1.ObjectId.isValid(testDetailsId)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Test Id is not valid"));
                }
                let savedTestDetails = yield test_details_1.default.findOne({
                    _id: testDetailsId,
                }, !testUserId
                    ? {
                        questions: 0,
                        prompt: 0,
                        noOfQuestions: 0,
                        difficulty: 0,
                    }
                    : { difficulty: 0, prompt: 0 })
                    .populate("accountUser")
                    .lean();
                if (!savedTestDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Test Id is not valid"));
                }
                if (testUserId) {
                    savedTestDetails.questions = (_a = savedTestDetails.questions) === null || _a === void 0 ? void 0 : _a.map((it) => {
                        var _a;
                        return (Object.assign(Object.assign({}, it), { options: (_a = it.options) === null || _a === void 0 ? void 0 : _a.map((tt) => (Object.assign(Object.assign({}, tt), { correctAnswer: undefined }))) }));
                    });
                }
                let testResultsCount = yield testresult_1.default.count({
                    testId: testDetailsId,
                    testUserId: testUserId,
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testDetails: savedTestDetails, attempted: testResultsCount }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postTest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let testDetails = req.body.testDetails;
                let { accountId } = req.user;
                console.log(req.user);
                if (!testDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("cartDetails needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                testDetails.accountUser = new mongodb_1.ObjectId(accountId);
                let savedTestDetails = yield new test_details_1.default(testDetails).save();
                if (!savedTestDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testDetails: savedTestDetails }, "Quiz added successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postGpt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let testDetails = req.body.testDetails;
                let { accountId } = req.user;
                if (!testDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testdetails needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    questions: [
                        {
                            question: "What is the capital of France?",
                            options: [
                                { option: "Paris", correctAnswer: true },
                                { option: "Madrid" },
                                { option: "London" },
                                { option: "Rome" },
                            ],
                            limit: "30 minutes",
                            authorEdited: "John Doe",
                            favorite: "Yes",
                        },
                        {
                            question: "Which planet is known as the Red Planet?",
                            options: [
                                { option: "Venus" },
                                { option: "Mars", correctAnswer: true },
                                { option: "Mercury" },
                                { option: "Saturn" },
                            ],
                            limit: "15 minutes",
                            authorEdited: "Jane Smith",
                            favorite: "No",
                        },
                        {
                            question: "What is the capital of France?",
                            options: [
                                { option: "Paris", correctAnswer: true },
                                { option: "Madrid" },
                                { option: "London" },
                                { option: "Rome" },
                            ],
                            limit: "30 minutes",
                            authorEdited: "John Doe",
                            favorite: "Yes",
                        },
                        {
                            question: "Which planet is known as the Red Planet?",
                            options: [
                                { option: "Venus" },
                                { option: "Mars", correctAnswer: true },
                                { option: "Mercury" },
                                { option: "Saturn" },
                            ],
                            limit: "15 minutes",
                            authorEdited: "Jane Smith",
                            favorite: "No",
                        },
                        {
                            question: "What is the capital of France?",
                            options: [
                                { option: "Paris", correctAnswer: true },
                                { option: "Madrid" },
                                { option: "London" },
                                { option: "Rome" },
                            ],
                            limit: "30 minutes",
                            authorEdited: "John Doe",
                            favorite: "Yes",
                        },
                        {
                            question: "Which planet is known as the Red Planet?",
                            options: [
                                { option: "Venus" },
                                { option: "Mars", correctAnswer: true },
                                { option: "Mercury" },
                                { option: "Saturn" },
                            ],
                            limit: "15 minutes",
                            authorEdited: "Jane Smith",
                            favorite: "No",
                        },
                        {
                            question: "What is the capital of France?",
                            options: [
                                { option: "Paris", correctAnswer: true },
                                { option: "Madrid" },
                                { option: "London" },
                                { option: "Rome" },
                            ],
                            limit: "30 minutes",
                            authorEdited: "John Doe",
                            favorite: "Yes",
                        },
                        {
                            question: "Which planet is known as the Red Planet?",
                            options: [
                                { option: "Venus" },
                                { option: "Mars", correctAnswer: true },
                                { option: "Mercury" },
                                { option: "Saturn" },
                            ],
                            limit: "15 minutes",
                            authorEdited: "Jane Smith",
                            favorite: "No",
                        },
                        {
                            question: "What is the capital of France?",
                            options: [
                                { option: "Paris", correctAnswer: true },
                                { option: "Madrid" },
                                { option: "London" },
                                { option: "Rome" },
                            ],
                            limit: "30 minutes",
                            authorEdited: "John Doe",
                            favorite: "Yes",
                        },
                        {
                            question: "Which planet is known as the Red Planet?",
                            options: [
                                { option: "Venus" },
                                { option: "Mars", correctAnswer: true },
                                { option: "Mercury" },
                                { option: "Saturn" },
                            ],
                            limit: "15 minutes",
                            authorEdited: "Jane Smith",
                            favorite: "No",
                        },
                        // Add more objects here
                    ],
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchTest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let testDetails = req.body.testDetails;
                let { accountId } = req.user;
                let { testDetailsId } = req.params;
                if (!testDetails || !testDetailsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testDetails/testDetailsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestDetails = yield test_details_1.default.updateOne({
                    _id: testDetailsId,
                }, { $set: testDetails }, { upsert: true });
                if (!savedTestDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testDetails: savedTestDetails }, "Quiz updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteTest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let { testDetailsId } = req.params;
                if (!testDetailsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testDetailsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestDetails = yield test_details_1.default.deleteOne({
                    _id: testDetailsId,
                });
                if (!savedTestDetails) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testDetails: savedTestDetails }, "Quiz deleted successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ProfileController;
//# sourceMappingURL=index.js.map