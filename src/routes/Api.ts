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
	AccountUserController.resetPassword
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


export default router;
