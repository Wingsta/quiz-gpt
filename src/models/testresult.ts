/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';

import { ITestResults } from '../interfaces/models/testResults';
import mongoose from '../providers/Database';
import { questionSchema } from './test_details';
import { Types } from 'mongoose';

// Create the model schema & register your custom methods here


// Define the User Schema
export const TestResultsSchema = new mongoose.Schema<ITestResults>(
  {
    startTime: { type: Date },
    endTime: { type: Date },
    testUserId: {  type: Types.ObjectId, ref: "TestUser" },
    feedbackForAuthor: { type: String },
    feedbackForProduct: { type: String },
   
    questions : {type : [questionSchema]},
    testId: { type: Types.ObjectId, ref: "test_details" },

  },
  {
    timestamps: true,
  }
);



const TestResults = mongoose.model<ITestResults & mongoose.Document>(
  "TestResult",
  TestResultsSchema
);

export default TestResults;
