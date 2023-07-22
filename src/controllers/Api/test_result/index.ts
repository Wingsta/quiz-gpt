import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { ITestResults } from "../../../interfaces/models/testResults";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../services/response/sendresponse";

import MTestResult from "../../../models/testresult";
import MTestDetails from "../../../models/test_details";

import moment = require("moment");

import * as fs from "fs";
import { replaceSpecialChars } from "../../../utils/constants";

class TestResultController {
  public static async getTestResults(
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
        testId,
      } = req.query as unknown as {
        limit: number;
        offset: number;
        sortBy: string;
        startDate: Date;
        endDate: Date;
        sortType: string;
        testId: string;
        searchTerm: string;
      };

      if (limit) {
        limit = parseInt(limit.toString());
      }

      if (offset) {
        offset = parseInt(offset.toString());
      }
      let mongoQuery = {
        // accountUser: new ObjectId(accountId),
      } as any;

      if (testId) {
        // let statusTypes = status.split(",");
        mongoQuery["testId"] = new ObjectId(testId);
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

      let testResults = await MTestResult.find(mongoQuery)
        .sort([[sortBy, sortType === "asc" ? 1 : -1]])
        .skip(offset)
        .limit(limit)
        .populate("testUserId")
        .lean();

      let count = await MTestResult.count(mongoQuery);

      if (testResults) {
        return res.json(
          sendSuccessResponse({
            
            testResults: testResults,
            count,
          })
        );
      }

      return res.json(sendErrorResponse("something went wrong"));
    } catch (error) {
      next(error);
    }
  }

  public static async getTestResultsCount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { id } = req.user as { id: string };

      if (!id) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let testResults = await MTestResult.count({
        accountUser: new ObjectId(id),
      });

      if (testResults !== undefined) {
        return res.json(
          sendSuccessResponse({
            count: testResults,
          })
        );
      }

      return res.json(sendErrorResponse("something went wrong"));
    } catch (error) {
      next(error);
    }
  }

  public static async getOneTestResults(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { accountId } = req.user as { accountId: string };
      let { testResultsId } = req.params as { testResultsId: string };

      if (!testResultsId) {
        return res.json(sendErrorResponse("testResultsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestResults = await MTestResult.findOne({
        _id: testResultsId,
      })
        .populate("testUserId")
        .lean();

      if (!savedTestResults) {
        return res.json(sendErrorResponse("testResults not found"));
      }

      return res.json(sendSuccessResponse({ testResults: savedTestResults }));
    } catch (error) {
      next(error);
    }
  }

  public static async getOneTestResultsPublic(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { testUserId } = (req.user as { testUserId: string }) || {};

      let { testResultsId } = req.params as { testResultsId: string };

      if (!testResultsId || !ObjectId.isValid(testResultsId)) {
        return res.json(sendErrorResponse("Test Id is not valid"));
      }

      let savedTestResults = await MTestResult.findOne(
        {
          _id: testResultsId,
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

      if (!savedTestResults) {
        return res.json(sendErrorResponse("Test Id is not valid"));
      }

      if (testUserId) {
        savedTestResults.questions = savedTestResults.questions?.map((it) => ({
          ...it,
          options: it.options?.map((tt) => ({
            ...tt,
            correctAnswer: undefined,
          })),
        }));
      }
      return res.json(sendSuccessResponse({ testResults: savedTestResults }));
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
      let testResults = req.body.testResults as ITestResults;
      let { testUserId } = req.user as { testUserId: string };

      
      if (!testResults) {
        return res.json(sendErrorResponse("testResults needed"));
      }

      if (!testUserId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      if (!testResults.testId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      testResults.testUserId = new ObjectId(testUserId);

      let testDetails = await MTestDetails.findOne(
        {
          _id: testResults.testId,
        },
        
      )
        
        .lean();


        if(testResults?.questions){
          testResults.questions = testResults?.questions.map(it => {
            let matchQuestions = testDetails?.questions?.find(tt => tt.questionId === it?.questionId)

            
            let options = it?.options?.map((mt) => ({
              ...mt,
              correctAnswer: matchQuestions?.options?.find(
                (kt) => kt._id && kt._id?.toString() === mt._id?.toString()
              )?.correctAnswer,
            }));

 
            it.options = options;

            return it
          })
        }
      let savedTestResults = await new MTestResult(testResults).save();

      if (!savedTestResults) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { },
          "Result added successfully!"
        )
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
      let testResults = req.body.testResults as ITestResults;
      let { accountId } = req.user as { accountId: string };
      let { testResultsId } = req.params as { testResultsId: string };

      if (!testResults || !testResultsId) {
        return res.json(sendErrorResponse("testResults/testResultsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestResults = await MTestResult.updateOne(
        {
          _id: testResultsId,
        },
        { $set: testResults },
        { upsert: true }
      );

      if (!savedTestResults) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { testResults: savedTestResults },
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
      let { testResultsId } = req.params as { testResultsId: string };

      if (!testResultsId) {
        return res.json(sendErrorResponse("testResultsId needed"));
      }

      if (!accountId) {
        return res.json(sendErrorResponse("unauthorised"));
      }

      let savedTestResults = await MTestResult.deleteOne({
        _id: testResultsId,
      });

      if (!savedTestResults) {
        return res.json(sendErrorResponse("productDetails not saved"));
      }

      return res.json(
        sendSuccessResponse(
          { testResults: savedTestResults },
          "Quiz deleted successfully!"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
export default TestResultController;
