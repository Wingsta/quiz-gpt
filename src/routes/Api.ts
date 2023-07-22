/**
 * Define all your API web-routes
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import { Router } from "express";
import * as expressJwt from "express-jwt";
import * as passport from "passport";
import Locals from "../providers/Locals";

import AccountUserController from "../controllers/Api/AccountUserAuth";
import AuthRefreshController from "../controllers/Api/Auth/RefreshToken";
import TestDetailsController from "../controllers/Api/test_details";
import TestUserController from "../controllers/Api/test_user";

// import { getScreenShot } from "../controllers/Api/common/pupeeter";

const router = Router();



router.post(
	"/signup",
	//   passport.authenticate("jwt", { session: false }),
	AccountUserController.signup
);


router.post(
	"/login",
	//   passport.authenticate("jwt", { session: false }),
	AccountUserController.login
);


router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  AccountUserController.changePassword
);

router.get(
	"/account-user",
	passport.authenticate("jwt", { session: false }),
	AccountUserController.getAccountUser
);

router.patch(
	"/account-user",
	passport.authenticate("jwt", { session: false }),
	AccountUserController.patchAccountUser
);

router.get(
  "/refreshToken",
  passport.authenticate("jwt", { session: false }),
  AuthRefreshController.perform
);

router.get(
  "/test-details/",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.getTestDetails
);

router.get(
  "/test-details/:testDetailsId",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.getOneTestDetails
);

router.post(
  "/test-details/",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.postTest
);

router.post(
  "/test-details/get-questions",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.postGpt
);


router.patch(
  "/test-details/:testDetailsId",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.patchTest
);


router.delete(
  "/test-details/:testDetailsId",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.deleteTest
);

router.get(
  "/public/login/",
  passport.authenticate("jwt", { session: false }),
  TestDetailsController.deleteTest
);

router.get(
  "/public/verify/:testDetailsId",
  
  TestDetailsController.getOneTestDetailsPublic
);


router.post(
  "/public/login",

  TestUserController.signup
);

router.get(
  "/public/test-user",
  passport.authenticate("profile", { session: false }),
  TestUserController.getTestUser
);

router.patch(
  "/public/test-user",
  passport.authenticate("profile", { session: false }),
  TestUserController.patchTestUser
);

router.get(
  "/public/refreshToken",
  passport.authenticate("profile", { session: false }),
  AuthRefreshController.performTestUser
);

router.get(
  "/public/test-details/:testDetailsId",
  passport.authenticate("profile", { session: false }),
  TestDetailsController.getOneTestDetailsPublic
);





export default router;
