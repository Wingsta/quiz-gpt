/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';

import { ITestDetails } from "../interfaces/models/testdetails";
import mongoose from '../providers/Database';
import { Types } from 'mongoose';

// Create the model schema & register your custom methods here


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
