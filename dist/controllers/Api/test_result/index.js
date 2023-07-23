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
const sendresponse_1 = require("../../../services/response/sendresponse");
const testresult_1 = require("../../../models/testresult");
const test_details_1 = require("../../../models/test_details");
const moment = require("moment");
class TestResultController {
    static getTestResults(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let { limit = 10, offset = 0, startDate, endDate, sortBy = "createdAt", sortType = "desc", testId, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = {
                // accountUser: new ObjectId(accountId),
                };
                if (testId) {
                    // let statusTypes = status.split(",");
                    mongoQuery["testId"] = new mongodb_1.ObjectId(testId);
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
                let testResults = yield testresult_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .populate("testUserId")
                    .lean();
                let count = yield testresult_1.default.count(mongoQuery);
                if (testResults) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        testResults: testResults,
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
    static getTestResultsCount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.user;
                if (!id) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let testResults = yield testresult_1.default.count({
                    accountUser: new mongodb_1.ObjectId(id),
                });
                if (testResults !== undefined) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        count: testResults,
                    }));
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOneTestResults(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { accountId } = req.user;
                let { testResultsId } = req.params;
                if (!testResultsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testResultsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestResults = yield testresult_1.default.findOne({
                    _id: testResultsId,
                })
                    .populate("testUserId")
                    .populate("testId")
                    .lean();
                if (!savedTestResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testResults not found"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testResults: savedTestResults }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOneTestResultsPublic(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { testUserId } = req.user || {};
                let { testResultsId } = req.params;
                if (!testResultsId || !mongodb_1.ObjectId.isValid(testResultsId)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Test Id is not valid"));
                }
                let savedTestResults = yield testresult_1.default.findOne({
                    _id: testResultsId,
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
                if (!savedTestResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Test Id is not valid"));
                }
                if (testUserId) {
                    savedTestResults.questions = (_a = savedTestResults.questions) === null || _a === void 0 ? void 0 : _a.map((it) => {
                        var _a;
                        return (Object.assign(Object.assign({}, it), { options: (_a = it.options) === null || _a === void 0 ? void 0 : _a.map((tt) => (Object.assign(Object.assign({}, tt), { correctAnswer: undefined }))) }));
                    });
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testResults: savedTestResults }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static postTest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let testResults = req.body.testResults;
                let { testUserId } = req.user;
                if (!testResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testResults needed"));
                }
                if (!testUserId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                if (!testResults.testId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                testResults.testUserId = new mongodb_1.ObjectId(testUserId);
                let testDetails = yield test_details_1.default.findOne({
                    _id: testResults.testId,
                })
                    .lean();
                if (testResults === null || testResults === void 0 ? void 0 : testResults.questions) {
                    testResults.questions = testResults === null || testResults === void 0 ? void 0 : testResults.questions.map(it => {
                        var _a, _b;
                        let matchQuestions = (_a = testDetails === null || testDetails === void 0 ? void 0 : testDetails.questions) === null || _a === void 0 ? void 0 : _a.find(tt => tt.questionId === (it === null || it === void 0 ? void 0 : it.questionId));
                        let options = (_b = it === null || it === void 0 ? void 0 : it.options) === null || _b === void 0 ? void 0 : _b.map((mt) => {
                            var _a, _b;
                            return (Object.assign(Object.assign({}, mt), { correctAnswer: (_b = (_a = matchQuestions === null || matchQuestions === void 0 ? void 0 : matchQuestions.options) === null || _a === void 0 ? void 0 : _a.find((kt) => { var _a, _b; return kt._id && ((_a = kt._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = mt._id) === null || _b === void 0 ? void 0 : _b.toString()); })) === null || _b === void 0 ? void 0 : _b.correctAnswer }));
                        });
                        it.options = options;
                        return it;
                    });
                }
                let savedTestResults = yield new testresult_1.default(testResults).save();
                if (!savedTestResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({}, "Result added successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchTest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let testResults = req.body.testResults;
                let { accountId } = req.user;
                let { testResultsId } = req.params;
                if (!testResults || !testResultsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testResults/testResultsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestResults = yield testresult_1.default.updateOne({
                    _id: testResultsId,
                }, { $set: testResults }, { upsert: true });
                if (!savedTestResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testResults: savedTestResults }, "Quiz updated successfully!"));
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
                let { testResultsId } = req.params;
                if (!testResultsId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("testResultsId needed"));
                }
                if (!accountId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("unauthorised"));
                }
                let savedTestResults = yield testresult_1.default.deleteOne({
                    _id: testResultsId,
                });
                if (!savedTestResults) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("productDetails not saved"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ testResults: savedTestResults }, "Quiz deleted successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = TestResultController;
//# sourceMappingURL=index.js.map