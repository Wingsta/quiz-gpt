"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITestDetailsSchema = exports.questionSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
exports.questionSchema = new Database_1.default.Schema({
    questionType: {
        type: String,
        default: "MCQ",
    },
    question: {
        type: String,
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    options: [
        {
            option: {
                type: String,
            },
            correctAnswer: {
                type: Boolean,
            },
            selected: {
                type: Boolean,
            },
            weightage: {
                type: Number,
                default: 1,
            },
        },
    ],
    answered: {
        type: Boolean,
    },
    limit: {
        type: String,
    },
    authorEdited: {
        type: String,
    },
    favorite: {
        type: String,
    },
});
// Define the User Schema
exports.ITestDetailsSchema = new Database_1.default.Schema({
    title: { type: String },
    logo: { type: String },
    description: { type: String },
    instructions: { type: String },
    noOfQuestions: { type: Number },
    difficulty: { type: Number },
    prompt: { type: String },
    questions: { type: [exports.questionSchema] },
    accountUser: { type: mongoose_1.Types.ObjectId, ref: "AccountUser" },
}, {
    timestamps: true,
});
const TestDetails = Database_1.default.model("test_details", exports.ITestDetailsSchema);
exports.default = TestDetails;
//# sourceMappingURL=test_details.js.map