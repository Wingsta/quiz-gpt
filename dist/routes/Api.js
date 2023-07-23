"use strict";
/**
 * Define all your API web-routes
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport = require("passport");
const AccountUserAuth_1 = require("../controllers/Api/AccountUserAuth");
const RefreshToken_1 = require("../controllers/Api/Auth/RefreshToken");
const test_details_1 = require("../controllers/Api/test_details");
const test_user_1 = require("../controllers/Api/test_user");
const test_result_1 = require("../controllers/Api/test_result");
// import { getScreenShot } from "../controllers/Api/common/pupeeter";
const router = (0, express_1.Router)();
router.post("/signup", 
//   passport.authenticate("jwt", { session: false }),
AccountUserAuth_1.default.signup);
router.post("/login", 
//   passport.authenticate("jwt", { session: false }),
AccountUserAuth_1.default.login);
router.post("/change-password", passport.authenticate("jwt", { session: false }), AccountUserAuth_1.default.changePassword);
router.get("/account-user", passport.authenticate("jwt", { session: false }), AccountUserAuth_1.default.getAccountUser);
router.patch("/account-user", passport.authenticate("jwt", { session: false }), AccountUserAuth_1.default.patchAccountUser);
router.get("/refreshToken", passport.authenticate("jwt", { session: false }), RefreshToken_1.default.perform);
router.get("/test-details/", passport.authenticate("jwt", { session: false }), test_details_1.default.getTestDetails);
router.get("/test-details/:testDetailsId", passport.authenticate("jwt", { session: false }), test_details_1.default.getOneTestDetails);
router.post("/test-details/", passport.authenticate("jwt", { session: false }), test_details_1.default.postTest);
router.post("/test-details/get-questions", passport.authenticate("jwt", { session: false }), test_details_1.default.postGpt);
router.patch("/test-details/:testDetailsId", passport.authenticate("jwt", { session: false }), test_details_1.default.patchTest);
router.delete("/test-details/:testDetailsId", passport.authenticate("jwt", { session: false }), test_details_1.default.deleteTest);
router.get("/test-results/", passport.authenticate("jwt", { session: false }), test_result_1.default.getTestResults);
router.get("/test-results/:testResultsId", passport.authenticate("jwt", { session: false }), test_result_1.default.getOneTestResults);
router.patch("/test-results/:testResultsId", passport.authenticate("jwt", { session: false }), test_result_1.default.patchTest);
router.delete("/test-results/:testResultsId", passport.authenticate("jwt", { session: false }), test_result_1.default.deleteTest);
router.get("/public/login/", passport.authenticate("jwt", { session: false }), test_details_1.default.deleteTest);
router.get("/public/verify/:testDetailsId", test_details_1.default.getOneTestDetailsPublic);
router.post("/public/login", test_user_1.default.signup);
router.get("/public/test-user", passport.authenticate("profile", { session: false }), test_user_1.default.getTestUser);
router.patch("/public/test-user", passport.authenticate("profile", { session: false }), test_user_1.default.patchTestUser);
router.get("/public/refreshToken", passport.authenticate("profile", { session: false }), RefreshToken_1.default.performTestUser);
router.get("/public/test-details/:testDetailsId", passport.authenticate("profile", { session: false }), test_details_1.default.getOneTestDetailsPublic);
router.get("/public/test-details/:testDetailsId", passport.authenticate("profile", { session: false }), test_details_1.default.getOneTestDetailsPublic);
router.post("/public/test-results", passport.authenticate("profile", { session: false }), test_result_1.default.postTest);
exports.default = router;
//# sourceMappingURL=Api.js.map