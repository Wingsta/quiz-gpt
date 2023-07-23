"use strict";
/**
 * Define Login Login for the API
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const mongodb_1 = require("mongodb");
const axios_1 = require("axios");
const company_1 = require("../../../models/company");
const sendresponse_1 = require("../../../services/response/sendresponse");
const products_1 = require("../../../models/products");
const posts_1 = require("../../../models/posts");
const constants_1 = require("../../../utils/constants");
const generateHash = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = bcrypt.genSaltSync(10);
    const hash = yield bcrypt.hashSync(plainPassword, salt);
    return hash;
});
class AccountUserAuth {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = req.body;
                let { companyId } = req.user;
                if (!body.userID) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no userId"));
                }
                if (!body.accessToken) {
                    return res.json({ error: "no accessToken" });
                }
                let data = yield saveBuisnessAccount(body.userID, body.accessToken);
                let meta = Object.assign({}, data);
                if (companyId) {
                    yield company_1.default.updateOne({ _id: new mongodb_1.ObjectId(companyId) }, { $set: { meta: meta } }, { upsert: true });
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(meta));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "createdTime", sortType = "asc", } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [{ name: new RegExp(searchTerm, "i") }];
                }
                let posts = yield Promise.all((yield posts_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .lean()).map((it) => __awaiter(this, void 0, void 0, function* () {
                    let products = yield products_1.default.find({
                        posts: { $in: [new mongodb_1.ObjectID(it._id)] },
                    }).lean();
                    it.products = products;
                    return it;
                })));
                let totalCount = yield posts_1.default.find(mongoQuery).count();
                //  let products1 = await Promise.all(
                //    products.map(async (it) => {
                //      let _id = it?._id;
                //      if (!_id) return { update: false, _id };
                //      delete it?._id;
                //      let update = await Product.updateOne(
                //        { _id: _id },
                //        { status: [1, 2, 3, 4][getRandomIntInclusive(0, 3)] },
                //        {
                //          upsert: true,
                //        }
                //      );
                //      return { update: !!update.ok, _id: _id };
                //    })
                //  );
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    totalCount,
                    currentPage: offset / limit + 1,
                    posts,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static createCarousel(req, res, next) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let { image_url, caption, productIds, name } = req.body;
                if (!companyId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no companyId"));
                }
                if (!image_url || !image_url.length) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no image_url"));
                }
                let company = yield company_1.default.findOne({ _id: new mongodb_1.ObjectID(companyId) });
                if (company.meta) {
                    let data = null;
                    if ((image_url === null || image_url === void 0 ? void 0 : image_url.length) === 1) {
                        data = yield savePost((_a = company === null || company === void 0 ? void 0 : company.meta) === null || _a === void 0 ? void 0 : _a.buisnessAccountId, (_b = company === null || company === void 0 ? void 0 : company.meta) === null || _b === void 0 ? void 0 : _b.accessToken, image_url[0], caption);
                    }
                    else
                        data = yield saveCarousel((_c = company === null || company === void 0 ? void 0 : company.meta) === null || _c === void 0 ? void 0 : _c.buisnessAccountId, (_d = company === null || company === void 0 ? void 0 : company.meta) === null || _d === void 0 ? void 0 : _d.accessToken, image_url, caption);
                    if ((_e = data === null || data === void 0 ? void 0 : data.data) === null || _e === void 0 ? void 0 : _e.id) {
                        let object = [
                            {
                                id: (_f = data === null || data === void 0 ? void 0 : data.data) === null || _f === void 0 ? void 0 : _f.id,
                                media_type: (image_url === null || image_url === void 0 ? void 0 : image_url.length) === 1 ? "POST" : "CAROUSEL",
                                image_url,
                                caption,
                                createdTime: new Date(),
                                name,
                                companyId,
                            },
                        ];
                        let posts = (_g = (yield posts_1.default.insertMany(object))) === null || _g === void 0 ? void 0 : _g.map((it) => it._id);
                        let k = yield products_1.default.updateMany({
                            _id: productIds.map((productId) => new mongodb_1.ObjectId(productId)),
                            companyId: new Object(companyId),
                        }, { $push: { posts: posts } }, { upsert: true });
                        console.log(k, posts);
                    }
                    return res.json((0, sendresponse_1.sendSuccessResponse)(data === null || data === void 0 ? void 0 : data.data));
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
function saveBuisnessAccount(userID, accessToken) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get facebook accounts for that user
            const response = yield axios_1.default.get(`https://graph.facebook.com/v14.0/${userID}?fields=accounts&access_token=${accessToken}`);
            if ((_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.accounts) === null || _b === void 0 ? void 0 : _b.data[0]) {
                let account = (_d = (_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.accounts) === null || _d === void 0 ? void 0 : _d.data[0];
                const longAccessToken = yield axios_1.default.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=453354629748227&client_secret=1b61388c5b6118edc6c49d34c13f80bc&fb_exchange_token=${accessToken}`);
                if ((_e = longAccessToken === null || longAccessToken === void 0 ? void 0 : longAccessToken.data) === null || _e === void 0 ? void 0 : _e.access_token) {
                    accessToken = (_f = longAccessToken === null || longAccessToken === void 0 ? void 0 : longAccessToken.data) === null || _f === void 0 ? void 0 : _f.access_token;
                }
                if (account === null || account === void 0 ? void 0 : account.id) {
                    //get facebook page token for that user
                    const pageToken = yield axios_1.default.get(`https://graph.facebook.com/${account === null || account === void 0 ? void 0 : account.id}?fields=access_token&access_token=${accessToken}`);
                    const buisnessAccount = yield axios_1.default.get(`https://graph.facebook.com/v14.0/${account === null || account === void 0 ? void 0 : account.id}?fields=instagram_business_account&access_token=${accessToken}`);
                    if ((_g = pageToken === null || pageToken === void 0 ? void 0 : pageToken.data) === null || _g === void 0 ? void 0 : _g.access_token) {
                        const commentSubscription = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${account === null || account === void 0 ? void 0 : account.id}/subscribed_apps?subscribed_fields=mention&access_token=${(_h = pageToken === null || pageToken === void 0 ? void 0 : pageToken.data) === null || _h === void 0 ? void 0 : _h.access_token}`);
                    }
                    if ((_k = (_j = buisnessAccount === null || buisnessAccount === void 0 ? void 0 : buisnessAccount.data) === null || _j === void 0 ? void 0 : _j.instagram_business_account) === null || _k === void 0 ? void 0 : _k.id) {
                        let ig = (_m = (_l = buisnessAccount === null || buisnessAccount === void 0 ? void 0 : buisnessAccount.data) === null || _l === void 0 ? void 0 : _l.instagram_business_account) === null || _m === void 0 ? void 0 : _m.id;
                        const buisnessAccountIG = yield axios_1.default.get(`https://graph.facebook.com/v14.0/${ig}?fields=id,name,profile_picture_url,username&access_token=${accessToken}`);
                        const subscriptions = yield axios_1.default.get(`https://graph.facebook.com/v14.0/${account === null || account === void 0 ? void 0 : account.id}/subscribed_apps?access_token=${(_o = pageToken === null || pageToken === void 0 ? void 0 : pageToken.data) === null || _o === void 0 ? void 0 : _o.access_token}`);
                        if (buisnessAccountIG === null || buisnessAccountIG === void 0 ? void 0 : buisnessAccountIG.data) {
                            return {
                                buisnessAccountData: buisnessAccountIG === null || buisnessAccountIG === void 0 ? void 0 : buisnessAccountIG.data,
                                buisnessAccountId: (_q = (_p = buisnessAccount === null || buisnessAccount === void 0 ? void 0 : buisnessAccount.data) === null || _p === void 0 ? void 0 : _p.instagram_business_account) === null || _q === void 0 ? void 0 : _q.id,
                                fbPageId: account === null || account === void 0 ? void 0 : account.id,
                                subscriptions: subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.data,
                                fbPageAccessToken: (_r = pageToken === null || pageToken === void 0 ? void 0 : pageToken.data) === null || _r === void 0 ? void 0 : _r.access_token,
                                accessToken,
                            };
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function savePost(buisnessAccountId, accessToken, image_url = "https://via.placeholder.com/200x250", caption = "vishal") {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get facebook accounts for that user
            // `https://graph.facebook.com/v14.0/${buisnessAccountId}/media?access_token=${accessToken}&image_url=https://via.placeholder.com/200x250&caption=%23BronzFonz`;
            const buisnessAccountIG = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${buisnessAccountId}/media?access_token=${accessToken}&image_url=${image_url}&caption=${caption}`);
            if (buisnessAccountIG === null || buisnessAccountIG === void 0 ? void 0 : buisnessAccountIG.data) {
                let id = (_a = buisnessAccountIG === null || buisnessAccountIG === void 0 ? void 0 : buisnessAccountIG.data) === null || _a === void 0 ? void 0 : _a.id;
                const publish = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${buisnessAccountId}/media_publish?creation_id=${id}&access_token=${accessToken}`);
                console.log(publish);
                return publish;
            }
            if (buisnessAccountIG) {
                return null;
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function saveCarousel(buisnessAccountId, accessToken, image_urls = ["https://via.placeholder.com/200x250"], caption = "vishal") {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get facebook accounts for that user
            // `https://graph.facebook.com/v14.0/${buisnessAccountId}/media?access_token=${accessToken}&image_url=https://via.placeholder.com/200x250&caption=%23BronzFonz`;
            if (!image_urls || !image_urls.length) {
                return null;
            }
            const containers = (yield Promise.all(image_urls.map((image_url) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                let container = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${buisnessAccountId}/media?access_token=${accessToken}&image_url=${image_url}&caption=${caption}&is_carousel_item=true`);
                return (_b = container === null || container === void 0 ? void 0 : container.data) === null || _b === void 0 ? void 0 : _b.id;
            })))).filter((it) => !!it);
            if (containers === null || containers === void 0 ? void 0 : containers.length) {
                const carouselContainer = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${buisnessAccountId}/media?access_token=${accessToken}&children=${containers.join(",")}&caption=${caption}&media_type=CAROUSEL`);
                console.log(carouselContainer);
                if (carouselContainer === null || carouselContainer === void 0 ? void 0 : carouselContainer.data) {
                    let id = (_a = carouselContainer === null || carouselContainer === void 0 ? void 0 : carouselContainer.data) === null || _a === void 0 ? void 0 : _a.id;
                    const publish = yield axios_1.default.post(`https://graph.facebook.com/v14.0/${buisnessAccountId}/media_publish?creation_id=${id}&access_token=${accessToken}`);
                    console.log(publish);
                    return publish;
                }
            }
            return null;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.default = AccountUserAuth;
//# sourceMappingURL=index.js.map