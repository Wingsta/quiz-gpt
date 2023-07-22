/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';

import { ITestUsers } from '../interfaces/models/testuser';
import mongoose from '../providers/Database';

// Create the model schema & register your custom methods here


// Define the User Schema
export const TestUserSchema = new mongoose.Schema<ITestUsers>(
  {
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    testCount: { type: Number },
  },
  {
    timestamps: true,
  }
);



const TestUser = mongoose.model<ITestUsers & mongoose.Document>(
  "TestUser",
  TestUserSchema
);

export default TestUser;
