/**
 * Define interface for Account User Model
 *
 * @author Vishal <vishal@vishhh.com>
 */
import { Types } from "mongoose";

export interface ITestDetails {
  _id: Types.ObjectId;
  title: string;
  logo: string;
  description: string;
  instructions: string;
  noOfQuestions: number;
  difficulty: number;
  prompt: string;
  accountUser: Types.ObjectId;
}
