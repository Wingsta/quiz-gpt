/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';

import { ITestDetails, IQuestions } from "../interfaces/models/testdetails";
import mongoose from '../providers/Database';
import { Types } from 'mongoose';

// Create the model schema & register your custom methods here
export const questionSchema = new mongoose.Schema<IQuestions>({
  questionType: {
    type: String,
    default: "MCQ",
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      option: {
        type: String,
        required: true,
      },
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
  limit: {
    type: String,
    required: true,
  },
  authorEdited: {
    type: String,
    required: true,
  },
  favorite: {
    type: String,
    required: true,
  },
});

// Define the User Schema
export const ITestDetailsSchema = new mongoose.Schema<ITestDetails>(
  {
    title: { type: String },
    logo: { type: String },
    description: { type: String },
    instructions: { type: String },
    noOfQuestions: { type: Number },
    difficulty: { type: Number },
    prompt: { type: String },
    questions : {type : questionSchema},
    accountUser: { type: Types.ObjectId, ref: "AccountUser" },
  },
  {
    timestamps: true,
  }
);



const TestDetails = mongoose.model<ITestDetails & mongoose.Document>(
  "test_details",
  ITestDetailsSchema
);

export default TestDetails;
