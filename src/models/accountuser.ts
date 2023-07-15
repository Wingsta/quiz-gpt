/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';

import { IAccountUser } from '../interfaces/models/accountuser';
import mongoose from '../providers/Database';

// Create the model schema & register your custom methods here


// Define the User Schema
export const AccountUserSchema = new mongoose.Schema<IAccountUser>(
  {
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    status: { type: String }
  },
  {
    timestamps: true,
  }
);



const AccountUser = mongoose.model<IAccountUser & mongoose.Document>(
  "AccountUser",
  AccountUserSchema
);

export default AccountUser;
