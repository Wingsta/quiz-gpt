/**
 * Define interface for Account User Model
 *
 * @author Vishal <vishal@vishhh.com>
 */
import { Types } from "mongoose";

export interface ITestQuestions {
  _id: Types.ObjectId;
  questionType: "MCQ";

  question: string;
  options?: {
    text: string;
    correctAnswer: boolean;
  }[];
  limit: string;
  authorEdited: number;
  favorite: number;
  testId: Types.ObjectId;
}
