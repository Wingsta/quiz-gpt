/**
 * Define Login Login for the API
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import TestUser from "../../../models/testuser";
import { ITestUsers } from "../../../interfaces/models/testuser";
import * as bcrypt from "bcryptjs";

// import { Types  } from "mongoose";
import Locals from "../../../providers/Locals";
import { ObjectID, ObjectId } from "mongodb";
import axios from "axios";

import {
  sendErrorResponse,
  sendResponse,
  sendSuccessResponse,
} from "../../../services/response/sendresponse";

interface ISignupGet extends ITestUsers {}

const generateHash = async (plainPassword: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = await bcrypt.hashSync(plainPassword, salt);
  return hash;
};
class TestUserAuth {
  public static async signup(req: Request, res: Response, next) {
    try {
      let body = req.body as ISignupGet & { type: "GOOGLE" };

      const email = body.email;

      if (!email) {
        return res.json(sendErrorResponse("no email"));
      }

      let testUser = await TestUser.findOne({
        email: body.email,
      }).lean();

      if (!testUser?._id) {
        testUser = await new TestUser(body).save();
      }

      if (testUser?._id) {
        const token = jwt.sign(
          {
            email: body.email,
            name: body.firstName,

            testUserId: testUser?._id,
          },
          Locals.config().profileSecret,
          {
            expiresIn: 60 * 60 * 30,
          }
        );

        return res.json(sendSuccessResponse({ token, account: testUser }));
      }
      return res.json(sendErrorResponse("signup failed"));
    } catch (error) {
      next(error);
    }
  }

  public static async getTestUser(req: Request, res: Response, next) {
    try {
      let { testUserId } = req.user as {
        companyId: string;
        testUserId: string;
      };

      let testUser = await TestUser.findOne({
        _id: new ObjectID(testUserId),
      }).lean();

      if (!testUser) {
        return res.json(sendErrorResponse("Account not found"));
      }

      return res.json(sendSuccessResponse(testUser, "success"));
      
    } catch (error) {
      next(error);
    }
  }

  public static async patchTestUser(req: Request, res: Response, next) {
    try {
      let { testUserId } = req.user as {
        companyId: string;
        testUserId: string;
      };

      let testUser = await TestUser.findOne({
        _id: new ObjectID(testUserId),
      }).lean();

      if (!testUser) {
        return res.json(sendErrorResponse("testUser not found"));
      }

      let testUserUpdateDoc = req.body as ITestUsers;

      if (!testUserUpdateDoc) {
        return res.json(sendErrorResponse("body to update not found"));
      }

      delete testUserUpdateDoc._id;
      delete testUserUpdateDoc.password;

      if (testUserUpdateDoc.phoneNumber) {
        let checkExisting = await TestUser.findOne({
          phoneNumber: testUserUpdateDoc.phoneNumber,
          _id: { $ne: new ObjectId(testUserId) },
        }).lean();

        if (checkExisting) {
          return res.json(
            sendErrorResponse("Phone number is aldready registered")
          );
        }
      }

      let testUserSaved = await TestUser.updateOne(
        { _id: testUserId },
        { $set: { ...testUserUpdateDoc } },
        { upsert: true }
      );

      if (testUserSaved?.ok)
        return res.json(sendSuccessResponse({}, "success"));
      else return res.json(sendErrorResponse("something went wrong"));
    } catch (error) {
      next(error);
    }
  }
}

export default TestUserAuth;
