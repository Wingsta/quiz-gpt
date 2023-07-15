/**
 * Define interface for Account User Model
 *
 * @author Vishal <vishal@vishhh.com>
 */
import { Types } from "mongoose";

export interface ITestUsers {
  _id: Types.ObjectId;
  email: string;

  phoneNumber: string;
  firstName: string;
  lastName: string;
  country: string;
  accountId: Types.ObjectId;
  testCount : number;
}
