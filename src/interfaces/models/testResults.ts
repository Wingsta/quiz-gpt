/**
 * Define interface for Account User Model
 *
 * @author Vishal <vishal@vishhh.com>
 */
import { Types } from "mongoose";
import { IQuestions } from "./testdetails";



export interface ITestResults {
  _id: Types.ObjectId;
  startTime: string;
  endTime: string;
  testUserId: Types.ObjectId;
  testId: Types.ObjectId;
  questions: IQuestions[];
  feedbackForAuthor : string;
  feedbackForProduct : string;
}
