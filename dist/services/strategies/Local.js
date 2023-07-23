"use strict";
/**
 * Define passport's local strategy
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const accountuser_1 = require("../../models/accountuser");
const passport_jwt_1 = require("passport-jwt");
const Locals_1 = require("../../providers/Locals");
var opts = {};
opts.jwtFromRequest = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = Locals_1.default.config().appSecret;
class Local {
    static init(_passport) {
        _passport.use(new passport_jwt_1.Strategy(opts, function (jwt_payload, done) {
            accountuser_1.default.findOne({ email: jwt_payload.email }, function (err, user) {
                if (err) {
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
//# sourceMappingURL=Local.js.map