import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { ITestDetails } from "../../../interfaces/models/testdetails";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../services/response/sendresponse";

import MTestDetails from "../../../models/test_details";

import moment = require("moment");

import * as fs from "fs";
import { replaceSpecialChars } from "../../../utils/constants";

class ProfileController {
  public static async getTestDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { accountId } = req.user as { accountId: string };

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let {
        limit = 10,
        offset = 0,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortType = "desc",
        status,
        searchTerm,
      } = req.query as unknown as {
        limit: number;
        offset: number;
        sortBy: string;
        startDate: Date;
        endDate: Date;
        sortType: string;
        status: string;
        searchTerm: string;
      };

      if (limit) {
        limit = parseInt(limit.toString());
      }

      if (offset) {
        offset = parseInt(offset.toString());
      }
      let mongoQuery = {
        accountUser: new ObjectId(accountId),
      } as any;

      if (status) {
        let statusTypes = status.split(",");
        mongoQuery["status"] = { $in: statusTypes };
      }

      if (startDate) {
        if (!mongoQuery["$and"]) {
          mongoQuery["$and"] = [];
        }
        mongoQuery["$and"].push({
          createdAt: {
            $gte: moment(startDate).startOf("day").toDate(),
          },
        });
      }

      if (endDate) {
        if (!mongoQuery["$and"]) {
          mongoQuery["$and"] = [];
        }
        mongoQuery["$and"].push({
          createdAt: {
            $lte: moment(endDate).endOf("day").toDate(),
          },
        });
      }

      if (searchTerm) {
        searchTerm = replaceSpecialChars(searchTerm);
        mongoQuery["$or"] = [
          { prompt: new RegExp(searchTerm, "i") },
          { title: new RegExp(searchTerm, "i") },
          { description: new RegExp(searchTerm, "i") },
        ];
      }
      let testDetails = await MTestDetails.find(mongoQuery)
        .sort([[sortBy, sortType === "asc" ? 1 : -1]])
        .skip(offset)
        .limit(limit)
        // .populate("userId")
        .lean();

      let count = await MTestDetails.count(mongoQuery);

      if (testDetails) {
        return res.json(
          sendSuccessResponse({
            testDetails: testDetails,
            count,
          })
        );
      }

      return res.json(sendErrorResponse("something went wrong"));
    } catch (error) {
      next(error);
    }
  }

  public static async getTestDetailsCount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { id } = req.user as { id: string };

      if (!id) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let testDetails = await MTestDetails.count({
        accountUser: new ObjectId(id),
      });

      if (testDetails !== undefined) {
        return res.json(
          sendSuccessResponse({
            count: testDetails,
          })
        );
      }

      return res.json(sendErrorResponse("something went wrong"));
    } catch (error) {
      next(error);
    }
  }

  public static async getOneTestDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { accountId } = req.user as { accountId: string };
      let { testDetailsId } = req.params as { testDetailsId: string };

      if (!testDetailsId) {
        return res.json(sendErrorResponse("testDetailsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestDetails = await MTestDetails.findOne({
        _id: testDetailsId,
      });

      if (!savedTestDetails) {
        return res.json(sendErrorResponse("testDetails not found"));
      }

      return res.json(sendSuccessResponse({ testDetails: savedTestDetails }));
    } catch (error) {
      next(error);
    }
  }

  public static async getOneTestDetailsPublic(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { testUserId } = req.user as { testUserId: string } || {};

      let { testDetailsId } = req.params as { testDetailsId: string };

      if (!testDetailsId || !ObjectId.isValid(testDetailsId)) {
        return res.json(sendErrorResponse("Test Id is not valid"));
      }

      let savedTestDetails = await MTestDetails.findOne(
        {
          _id: testDetailsId,
        },
        !testUserId
          ? {
              questions: 0,
              prompt: 0,
              noOfQuestions: 0,
              difficulty: 0,
            }
          : { difficulty: 0, prompt: 0 }
      )
        .populate("accountUser")
        .lean();

      if (!savedTestDetails) {
        return res.json(sendErrorResponse("Test Id is not valid"));
      }

      if (testUserId) {
        savedTestDetails.questions = savedTestDetails.questions?.map((it) => ({
          ...it,
          options: it.options?.map((tt) => ({
            ...tt,
            correctAnswer: undefined,
          })),
        }));
      }
      return res.json(sendSuccessResponse({ testDetails: savedTestDetails }));
    } catch (error) {
      next(error);
    }
  }

  public static async postTest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let testDetails = req.body.testDetails as ITestDetails;
      let { accountId } = req.user as { accountId: string };

      console.log(req.user);
      if (!testDetails) {
        return res.json(sendErrorResponse("cartDetails needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      testDetails.accountUser = new ObjectId(accountId);

      let savedTestDetails = await new MTestDetails(testDetails).save();

      if (!savedTestDetails) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { testDetails: savedTestDetails },
          "Quiz added successfully!"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async postGpt(req: Request, res: Response, next: NextFunction) {
    try {
      let testDetails = req.body.testDetails as ITestDetails;
      let { accountId } = req.user as { accountId: string };

      if (!testDetails) {
        return res.json(sendErrorResponse("testdetails needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      return res.json(
        sendSuccessResponse({
          questions: [
            {
              question: "What is the capital of France?",
              options: [
                { option: "Paris", correctAnswer: true },
                { option: "Madrid" },
                { option: "London" },
                { option: "Rome" },
              ],
              limit: "30 minutes",
              authorEdited: "John Doe",
              favorite: "Yes",
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: [
                { option: "Venus" },
                { option: "Mars", correctAnswer: true },
                { option: "Mercury" },
                { option: "Saturn" },
              ],
              limit: "15 minutes",
              authorEdited: "Jane Smith",
              favorite: "No",
            },
            {
              question: "What is the capital of France?",
              options: [
                { option: "Paris", correctAnswer: true },
                { option: "Madrid" },
                { option: "London" },
                { option: "Rome" },
              ],
              limit: "30 minutes",
              authorEdited: "John Doe",
              favorite: "Yes",
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: [
                { option: "Venus" },
                { option: "Mars", correctAnswer: true },
                { option: "Mercury" },
                { option: "Saturn" },
              ],
              limit: "15 minutes",
              authorEdited: "Jane Smith",
              favorite: "No",
            },
            {
              question: "What is the capital of France?",
              options: [
                { option: "Paris", correctAnswer: true },
                { option: "Madrid" },
                { option: "London" },
                { option: "Rome" },
              ],
              limit: "30 minutes",
              authorEdited: "John Doe",
              favorite: "Yes",
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: [
                { option: "Venus" },
                { option: "Mars", correctAnswer: true },
                { option: "Mercury" },
                { option: "Saturn" },
              ],
              limit: "15 minutes",
              authorEdited: "Jane Smith",
              favorite: "No",
            },
            {
              question: "What is the capital of France?",
              options: [
                { option: "Paris", correctAnswer: true },
                { option: "Madrid" },
                { option: "London" },
                { option: "Rome" },
              ],
              limit: "30 minutes",
              authorEdited: "John Doe",
              favorite: "Yes",
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: [
                { option: "Venus" },
                { option: "Mars", correctAnswer: true },
                { option: "Mercury" },
                { option: "Saturn" },
              ],
              limit: "15 minutes",
              authorEdited: "Jane Smith",
              favorite: "No",
            },
            {
              question: "What is the capital of France?",
              options: [
                { option: "Paris", correctAnswer: true },
                { option: "Madrid" },
                { option: "London" },
                { option: "Rome" },
              ],
              limit: "30 minutes",
              authorEdited: "John Doe",
              favorite: "Yes",
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: [
                { option: "Venus" },
                { option: "Mars", correctAnswer: true },
                { option: "Mercury" },
                { option: "Saturn" },
              ],
              limit: "15 minutes",
              authorEdited: "Jane Smith",
              favorite: "No",
            },
            // Add more objects here
          ],
        })
      );
    } catch (error) {
      next(error);
    }
  }

  public static async patchTest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let testDetails = req.body.testDetails as ITestDetails;
      let { accountId } = req.user as { accountId: string };
      let { testDetailsId } = req.params as { testDetailsId: string };

      if (!testDetails || !testDetailsId) {
        return res.json(sendErrorResponse("testDetails/testDetailsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestDetails = await MTestDetails.updateOne(
        {
          _id: testDetailsId,
        },
        { $set: testDetails },
        { upsert: true }
      );

      if (!savedTestDetails) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { testDetails: savedTestDetails },
          "Quiz updated successfully!"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async deleteTest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { accountId } = req.user as { accountId: string };
      let { testDetailsId } = req.params as { testDetailsId: string };

      if (!testDetailsId) {
        return res.json(sendErrorResponse("testDetailsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestDetails = await MTestDetails.deleteOne({
        _id: testDetailsId,
      });

      if (!savedTestDetails) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { testDetails: savedTestDetails },
          "Quiz deleted successfully!"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
export default ProfileController;
