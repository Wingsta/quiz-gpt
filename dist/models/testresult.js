"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestResultsSchema = void 0;
const Database_1 = require("../providers/Database");
const test_details_1 = require("./test_details");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.TestResultsSchema = new Database_1.default.Schema({
    startTime: { type: Date },
    endTime: { type: Date },
    testUserId: { type: mongoose_1.Types.ObjectId, ref: "TestUser" },
    feedbackForAuthor: { type: String },
    feedbackForProduct: { type: String },
    questions: { type: [test_details_1.questionSchema] },
    testId: { type: mongoose_1.Types.ObjectId, ref: "test_details" },
}, {
    timestamps: true,
});
const TestResults = Database_1.default.model("TestResult", exports.TestResultsSchema);
exports.default = TestResults;
//# sourceMappingURL=testresult.js.map