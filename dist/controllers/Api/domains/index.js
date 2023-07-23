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
const company_1 = require("../../../models/company");
const products_1 = require("../../../models/products");
const sendresponse_1 = require("../../../services/response/sendresponse");
const domain_1 = require("../../../models/domain");
let constants = [
    "subdomain",
    "auth",
    "dashboard",
    "product",
    "instagram",
    "subdomain",
    "website",
    "orders",
    "payments",
    "customers",
    "analytics",
    "profile",
    "messages",
    "delivery",
    "inventory",
];
class Products {
    static get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.query.name;
                if (constants.includes(name)) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        exists: true,
                    }));
                }
                let { companyId } = req.user;
                let company = yield company_1.default.findOne({ _id: companyId }).lean();
                if (!company) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("company not found"));
                }
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name should not be empty"));
                }
                let oldDomain = (yield domain_1.default.find({ companyId }).lean())[0];
                if (oldDomain) {
                    let meta = company.meta;
                    if (!meta) {
                        meta = {};
                    }
                    meta.domainName = oldDomain.name;
                    meta.domainId = oldDomain._id;
                    let status = yield company_1.default.updateOne({ _id: company }, { $set: { meta } }, { upsert: true });
                    if (status.ok) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Domain exists , try again.", null, {
                            domain: oldDomain,
                        }));
                    }
                }
                let mongoQuery = { [`meta.domainName`]: name.toLowerCase() };
                let products = yield company_1.default.findOne(mongoQuery);
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
                    exists: !!products,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPaths(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = (_a = (yield company_1.default.find({}).lean()).map((it) => { var _a; return (_a = it.meta) === null || _a === void 0 ? void 0 : _a.domainName; })) === null || _a === void 0 ? void 0 : _a.filter(it => !!it);
                if (!domain || !(domain === null || domain === void 0 ? void 0 : domain.length)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("No domains found"));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    domains: domain,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPathSlugs(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let products = ((_b = (_a = (yield products_1.default.find({}).populate('companyId'))) === null || _a === void 0 ? void 0 : _a.filter(it => { var _a, _b; return ((_b = (_a = it === null || it === void 0 ? void 0 : it.companyId) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.domainName) && (it === null || it === void 0 ? void 0 : it.slug); })) === null || _b === void 0 ? void 0 : _b.map(it => { var _a, _b; return ({ domain: (_b = (_a = it === null || it === void 0 ? void 0 : it.companyId) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.domainName, slug: it.slug }); })) || [];
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    products,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static post(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.body.name;
                if (constants.includes(req.body.name)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("restricted keywrod"));
                }
                let { companyId } = req.user;
                let company = yield company_1.default.findOne({ _id: companyId }).lean();
                if (!company) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("company not found"));
                }
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name should not be empty"));
                }
                let oldDomain = (yield domain_1.default.find({ companyId }).lean())[0];
                if (oldDomain) {
                    let meta = company.meta;
                    if (!meta) {
                        meta = {};
                    }
                    meta.domainName = oldDomain.name;
                    meta.domainId = oldDomain._id;
                    let status = yield company_1.default.updateOne({ _id: company }, { $set: { meta } }, { upsert: true });
                    if (status.ok) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Domain exists , try again.", null, {
                            domain: oldDomain,
                        }));
                    }
                }
                let domain = (yield domain_1.default.insertMany({ name: name.toLowerCase(), companyId }))[0];
                if (domain) {
                    let meta = company.meta;
                    if (!meta) {
                        meta = {};
                    }
                    meta.domainName = name;
                    meta.domainId = domain._id;
                    let status = yield company_1.default.updateOne({ _id: company }, { $set: { meta } }, { upsert: true });
                    if (status.ok) {
                        return res.json((0, sendresponse_1.sendSuccessResponse)(Object.assign(Object.assign({ domainId: domain._id }, meta), { published: false })));
                    }
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchDomain(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = req.body;
                let domainId = req.params.domain;
                let { companyId } = req.user;
                if (!domain || !domain.metaData) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("not a domain object"));
                }
                let update = yield domain_1.default.updateOne({ _id: domainId }, { $set: { metaData: domain.metaData } }, { upsert: true });
                if (update.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ updated: true }));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patchDomainMeta(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let meta = req.body;
                let domainId = req.params.domain;
                let { companyId } = req.user;
                if (!meta) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("not a meta object"));
                }
                let domainMeta = (_a = (yield domain_1.default.findOne({ _id: domainId }).lean())) === null || _a === void 0 ? void 0 : _a.metaData;
                if (!domainMeta) {
                    domainMeta = {};
                }
                let update = yield domain_1.default.updateOne({ _id: domainId }, { $set: { metaData: Object.assign(Object.assign({}, domainMeta), meta) } }, { upsert: true });
                if (update.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ updated: true }));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static togglePublish(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = req.body;
                let domainId = req.params.domain;
                let { companyId } = req.user;
                if (!domain) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("not a domain object"));
                }
                console.log(domain);
                let update = yield domain_1.default.updateOne({ _id: domainId }, { $set: { published: !!domain.published } }, { upsert: true });
                if (update.ok)
                    return res.json((0, sendresponse_1.sendSuccessResponse)({ updated: true }));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getDomain(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domain = req.body.domain;
                if (domain)
                    return res.json((0, sendresponse_1.sendSuccessResponse)(domain));
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getDomainMiddleWare(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let domainId = req.params.domain;
                let { companyId } = req.user;
                if (!domainId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("domainId needed"));
                }
                let domain = yield domain_1.default.findOne({ _id: domainId, companyId }).lean();
                if ((_b = (_a = domain === null || domain === void 0 ? void 0 : domain.metaData) === null || _a === void 0 ? void 0 : _a.popularProducts) === null || _b === void 0 ? void 0 : _b.length) {
                    let products = yield products_1.default.find({
                        companyId,
                        _id: { $in: (_c = domain === null || domain === void 0 ? void 0 : domain.metaData) === null || _c === void 0 ? void 0 : _c.popularProducts },
                    }).lean();
                    domain.metaData.popularProducts = products;
                }
                if (domain) {
                    req.body.domain = domain;
                    return next();
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("something went wrong"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPublicDomainProducts(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.params.domain;
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name not found", 1002));
                }
                let domainData = yield getDomain(name);
                if (domainData.data) {
                    let companyId = (_b = (_a = domainData === null || domainData === void 0 ? void 0 : domainData.data) === null || _a === void 0 ? void 0 : _a.company) === null || _b === void 0 ? void 0 : _b._id;
                    req.user = { companyId: companyId };
                    return next();
                }
                else
                    return res.json(domainData);
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static getPublicDomain(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.params.domain;
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name not found", 1002));
                }
                let data = yield getDomain(name);
                return res.json(data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPublicDomainMiddleWare(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.params.domain;
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name not found", 1002));
                }
                let data = yield getDomain(name);
                if (data && (data === null || data === void 0 ? void 0 : data.data)) {
                    req.body.domain = data === null || data === void 0 ? void 0 : data.data;
                    return next();
                }
                return res.json((0, sendresponse_1.sendErrorResponse)("domain not found", 1002));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static checkSubdomain(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = req.params.domain;
                if (!name) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("name not found", 1002));
                }
                if (constants.includes(name)) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("restricted keywrod"));
                }
                let mongoQuery = { [`meta.domainName`]: name };
                let company = yield company_1.default.findOne(mongoQuery);
                let domainId = (_a = company === null || company === void 0 ? void 0 : company.meta) === null || _a === void 0 ? void 0 : _a.domainId;
                if (!domainId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("domainId needed"));
                }
                let domain = yield domain_1.default.findOne({ _id: domainId }).lean();
                let payload = {
                    exist: false,
                    published: false,
                };
                if (domain) {
                    payload.exist = true;
                    payload.published = (domain === null || domain === void 0 ? void 0 : domain.published) ? true : false;
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(payload));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
function getDomain(name) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        let mongoQuery = { [`meta.domainName`]: name };
        let company = yield company_1.default.findOne(mongoQuery).select({
            razorpaySecretKey: 0,
        });
        if (!((_a = company === null || company === void 0 ? void 0 : company.meta) === null || _a === void 0 ? void 0 : _a.domainId)) {
            return (0, sendresponse_1.sendErrorResponse)("domainId invalid");
        }
        let domainId = company.meta.domainId;
        if (!domainId) {
            return (0, sendresponse_1.sendErrorResponse)("domainId needed");
        }
        let domain = yield domain_1.default.findOne({ _id: domainId }).lean();
        if ((_c = (_b = domain === null || domain === void 0 ? void 0 : domain.metaData) === null || _b === void 0 ? void 0 : _b.popularProducts) === null || _c === void 0 ? void 0 : _c.length) {
            let products = yield products_1.default.find({
                companyId: company._id,
                _id: { $in: (_d = domain === null || domain === void 0 ? void 0 : domain.metaData) === null || _d === void 0 ? void 0 : _d.popularProducts },
            }).lean();
            domain.metaData.popularProducts = products;
        }
        if (domain)
            return (0, sendresponse_1.sendSuccessResponse)(Object.assign(Object.assign({}, domain), { company }));
        return (0, sendresponse_1.sendErrorResponse)("something went wrong");
    });
}
exports.default = Products;
//# sourceMappingURL=index.js.map