"use strict";
/**
 * Define passport's local strategy
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const Locals_1 = require("../../providers/Locals");
const testuser_1 = require("../../models/testuser");
var opts = {};
opts.jwtFromRequest = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = Locals_1.default.config().profileSecret;
class Local {
    static init(_passport) {
        _passport.use('profile', new passport_jwt_1.Strategy(opts, function (jwt_payload, done) {
            testuser_1.default.findOne({ _id: jwt_payload.testUserId }, function (err, user) {
                if (err) {
                    console.log(err);
                    return done(err, false);
                }
                if (user) {
                    return done(null, jwt_payload);
                }
                else {
                    return done(null, false);
                    // or you could create a new account
                }
            });
        }));
    }
}
exports.default = Local;
//# sourceMappingURL=Profile.js.map