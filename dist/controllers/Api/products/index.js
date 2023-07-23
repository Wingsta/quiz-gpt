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
exports.statusMap = void 0;
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const typeCheckService = require("../../../services/validations/typecheck");
const mongodb_1 = require("mongodb");
const slug = require("slug");
const axios_1 = require("axios");
const XLSX = require("xlsx");
const company_1 = require("../../../models/company");
const products_1 = require("../../../models/products");
const category_1 = require("../../../models/category");
const sendresponse_1 = require("../../../services/response/sendresponse");
const upload_1 = require("../../../services/gcloud/upload");
const common_1 = require("../common/common");
const constants_1 = require("../../../utils/constants");
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
exports.statusMap = {
    "in stock": 1,
    "low stock": 2,
    "out of stock": 3,
    closed: 4,
};
class Products {
    static get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "addedDate", sortType = "asc", status, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                const { categoryId } = req.body;
                let mongoQuery = { companyId };
                if (categoryId && categoryId.length > 0) {
                    mongoQuery.categoryId = { $in: categoryId };
                }
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { sku: new RegExp(searchTerm, "i") },
                        { name: new RegExp(searchTerm, "i") },
                    ];
                }
                let products = yield products_1.default.find(mongoQuery)
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let totalCount = yield products_1.default.find(mongoQuery).count();
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
                    products,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllProducts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 10, offset = 0, sortBy = "addedDate", sortType = "asc", status, } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                if (status) {
                    let statusTypes = status.split(",");
                    mongoQuery["status"] = { $in: statusTypes };
                }
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { sku: new RegExp(searchTerm, "i") },
                        { name: new RegExp(searchTerm, "i") },
                    ];
                }
                let products = yield products_1.default.find(Object.assign(Object.assign({}, mongoQuery), { categoryId: { $in: null } }))
                    .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let productsGrossing = yield products_1.default.find(mongoQuery)
                    .sort([["price", -1]])
                    .skip(0)
                    .limit(10)
                    .lean();
                let productsRecent = yield products_1.default.find(mongoQuery)
                    .sort([["updatedAt", -1]])
                    .skip(0)
                    .limit(5)
                    .lean();
                let totalCount = yield products_1.default.find(mongoQuery).count();
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
                    products,
                    productsGrossing,
                    productsRecent,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { companyId } = req.user;
                let mongoQuery = { companyId };
                let limit = 5;
                let category = yield category_1.default.find(Object.assign(Object.assign({}, mongoQuery), { isActive: true }))
                    .select({
                    name: 1,
                    isActive: 1,
                    productCount: 1,
                })
                    .sort({ order: 1, createdAt: -1 })
                    .lean();
                // mongoQuery.categoryId = { $ne: null };
                mongoQuery.categoryId = { $in: category.slice(0, limit).map(x => x._id) };
                let categoryProduct = yield products_1.default.aggregate([
                    {
                        $match: mongoQuery,
                    },
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $group: {
                            _id: "$categoryId",
                            data: { $push: "$$ROOT" },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            data: {
                                $slice: ["$data", 0, 12],
                            },
                        },
                    },
                ]);
                let categoryCount = yield category_1.default.countDocuments({ companyId, isActive: true });
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    category,
                    product: categoryProduct,
                    moreCategory: categoryCount > limit ? limit : 0
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getIdPosts(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let productId = req.params.productId;
                let { companyId } = req.user;
                if (!productId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not found", 1002));
                }
                let mongoQuery = { companyId };
                if (productId) {
                    mongoQuery["_id"] = productId;
                }
                let posts = (_a = (yield products_1.default.findOne(mongoQuery).populate("posts"))) === null || _a === void 0 ? void 0 : _a.posts;
                let metrics = posts.map((it) => ({
                    id: it._id,
                    engagement: faker_1.faker.datatype.number({ max: 300 }),
                    impressions: faker_1.faker.datatype.number({ max: 300 }),
                    reach: faker_1.faker.datatype.number({ max: 300 }),
                    saved: faker_1.faker.datatype.number({ max: 300 }),
                    video_views: faker_1.faker.datatype.number({ max: 300 }),
                    comments_count: faker_1.faker.datatype.number({ max: 300 }),
                    like_count: faker_1.faker.datatype.number({ max: 300 }),
                }));
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
                if (!posts) {
                    return res
                        .status(400)
                        .json((0, sendresponse_1.sendErrorResponse)("no product found", 1002));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    posts,
                    metrics,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let productId = req.params.productId;
                let { companyId } = req.user;
                if (!productId) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not found", 1002));
                }
                let mongoQuery = { companyId };
                if (productId) {
                    mongoQuery["_id"] = productId;
                }
                console.log(mongoQuery);
                let product = yield products_1.default.findOne(mongoQuery)
                    .populate("posts")
                    .populate("categoryId", { name: 1 });
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
                if (!product) {
                    return res
                        .status(400)
                        .json((0, sendresponse_1.sendErrorResponse)("no product found", 1002));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    product,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getProductDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let slug = req.params.slug;
                let { companyId } = req.user;
                if (!slug) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not found", 1002));
                }
                let mongoQuery = { companyId };
                if (slug) {
                    mongoQuery["slug"] = slug;
                }
                let product = yield products_1.default.findOne(mongoQuery).populate("posts");
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
                if (!product) {
                    return res
                        .status(400)
                        .json((0, sendresponse_1.sendErrorResponse)("no product found", 1002));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    product,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static checkAndUpdateSlug(slug, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedSlug = slug;
            // check if the exact slug already exists in the collection
            const slugExists = yield products_1.default.findOne({ slug: updatedSlug });
            // if the exact slug doesn't exist, find the last document in the collection with a matching slug and suffix
            if (slugExists) {
                const regex = new RegExp(`^${slug}-(\\d+)$`);
                const lastDoc = yield products_1.default.find({
                    slug: regex,
                    companyId: new mongodb_1.ObjectId(companyId),
                })
                    .sort({ $natural: -1 })
                    .limit(1)
                    .lean();
                // if a matching document was found, extract the suffix and increment it
                if (lastDoc.length > 0) {
                    const matches = regex.exec(lastDoc[0].slug);
                    const suffix = parseInt(matches[1], 10) + 1;
                    updatedSlug = `${slug}-${suffix}`;
                }
                else {
                    updatedSlug = `${slug}-1`;
                }
            }
            // return the updated slug
            return updatedSlug;
        });
    }
    static post(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let productArr = req.body.products;
                let { companyId } = req.user;
                let names = yield Promise.all(productArr
                    .map((it) => it.name)
                    .filter((it) => !!it)
                    .map((it) => __awaiter(this, void 0, void 0, function* () {
                    let slugValue = slug(it);
                    slugValue = yield Products.checkAndUpdateSlug(slugValue, companyId);
                    return { name: it, slug: slugValue };
                })));
                // console.log(names);
                // return res.json(names);
                productArr = (_b = (_a = productArr === null || productArr === void 0 ? void 0 : productArr.filter((it) => it.name)) === null || _a === void 0 ? void 0 : _a.map((it) => {
                    var _a;
                    return (Object.assign(Object.assign({}, it), { slug: (_a = names.find((nt) => nt.name === it.name)) === null || _a === void 0 ? void 0 : _a.slug, companyId: new mongodb_1.ObjectId(companyId) }));
                })) === null || _b === void 0 ? void 0 : _b.filter((it) => it.slug);
                if (!productArr || !productArr.length) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not array / empty"));
                }
                let categoryId = (_c = productArr[0]) === null || _c === void 0 ? void 0 : _c.categoryId;
                if (categoryId) {
                    let category = yield category_1.default.findOne({
                        companyId,
                        _id: categoryId,
                    });
                    if (!category) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Invalid category id"));
                    }
                }
                if ((_d = productArr === null || productArr === void 0 ? void 0 : productArr[0]) === null || _d === void 0 ? void 0 : _d.slug) {
                    yield Products.allForLoadingCache(companyId, productArr[0].slug);
                }
                let products = yield products_1.default.insertMany(productArr);
                (0, common_1.updateCategoryProduct)(categoryId);
                return res.json((0, sendresponse_1.sendSuccessResponse)(products));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static allForLoadingCache(companyId, slug) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let companyDetails = yield company_1.default.findOne({
                companyId: new mongodb_1.ObjectId(companyId),
            }).lean();
            const options = {
                url: `https://sociallink.one/${(_a = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.meta) === null || _a === void 0 ? void 0 : _a.domainName}/product/${slug}`,
                method: "GET",
            };
            yield (0, axios_1.default)(options);
        });
    }
    static bulkUpload(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = req.file;
                let { companyId } = req.user;
                let fileUrl = (yield (0, upload_1.uploadImage)(file, companyId));
                if (!fileUrl) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("no file found / error in upload"));
                }
                const options = {
                    url: fileUrl,
                    method: "GET",
                    responseType: "arraybuffer",
                };
                let axiosResponse = yield (0, axios_1.default)(options);
                const workbook = XLSX.read(axiosResponse.data);
                let worksheets = workbook.SheetNames.map((sheetName) => {
                    return {
                        sheetName,
                        data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]),
                    };
                });
                if (worksheets[0].data.length === 1 &&
                    Object.values(worksheets[0].data[0]).every((x) => x === null || x === "")) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)([]));
                }
                let errorRows = [];
                let names = [];
                let finalData = worksheets[0].data
                    .filter((it) => {
                    var _a;
                    if (!it.name) {
                        errorRows.push(it);
                        return false;
                    }
                    if (!typeCheckService.isText(it.name)) {
                        if (!typeCheckService.isText((_a = it === null || it === void 0 ? void 0 : it.name) === null || _a === void 0 ? void 0 : _a.toString())) {
                            errorRows.push(it);
                            return false;
                        }
                    }
                    return true;
                })
                    .map((it) => {
                    var _a;
                    if (it.carouselImages instanceof String) {
                        it.carouselImages = (_a = it.carouselImages) === null || _a === void 0 ? void 0 : _a.split(",").filter((kt) => typeCheckService.isValidHttpUrl(kt));
                    }
                    if (it.thumbnail && !typeCheckService.isValidHttpUrl(it.thumbnail)) {
                        it.thumbnail = null;
                    }
                    if (!typeCheckService.isText(it.name)) {
                        it.name = it.name.toString().trim();
                    }
                    names.push(it.name);
                    if (!typeCheckService.isText(it.sku)) {
                        it.sku = it.sku.toString().trim();
                    }
                    if (it.status) {
                        it.status = exports.statusMap[it.status] || 1;
                    }
                    return it;
                });
                names = names === null || names === void 0 ? void 0 : names.filter((i, n, a) => !!i && a.indexOf(i) === n);
                names = yield Promise.all(names.map((it) => __awaiter(this, void 0, void 0, function* () {
                    let slugValue = slug(it);
                    slugValue = yield Products.checkAndUpdateSlug(slugValue, companyId);
                    return { name: it, slug: slugValue };
                })));
                console.log(names);
                let productArr = (_a = finalData
                    .map((it) => {
                    var _a;
                    return ({
                        sku: typeCheckService.isText(it["sku"]),
                        name: typeCheckService.isText(it["name"]),
                        price: typeCheckService.isNumber(it["price"]) || 0,
                        status: it["status"] || 1,
                        quantity: typeCheckService.isNumber(it["quantity"]) || 0,
                        addedDate: typeCheckService.isDate(it["addedDate"])
                            ? new Date(typeCheckService.isDate(it["addedDate"]))
                            : new Date(),
                        thumbnail: it["thumbnail"],
                        carouselImages: it["carouselImages"] || [],
                        slug: (_a = names.find((st) => st.name === it.name)) === null || _a === void 0 ? void 0 : _a.slug,
                        // category: it["category"],
                    });
                })) === null || _a === void 0 ? void 0 : _a.filter((it) => !!it.slug);
                let productArrInsert = (_b = productArr === null || productArr === void 0 ? void 0 : productArr.filter((it) => it.sku)) === null || _b === void 0 ? void 0 : _b.map((it) => ({
                    updateOne: {
                        filter: { sku: it.sku, companyId: new mongodb_1.ObjectId(companyId) },
                        update: Object.assign(Object.assign({}, it), { companyId: new mongodb_1.ObjectId(companyId) }),
                        upsert: true,
                    },
                }));
                if (!productArr || !productArr.length) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not array / empty"));
                }
                yield products_1.default.bulkWrite(productArrInsert);
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    productsUploaded: productArr === null || productArr === void 0 ? void 0 : productArr.length,
                    errorCount: (errorRows === null || errorRows === void 0 ? void 0 : errorRows.length) || 0,
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static patch(req, res, next) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let productArr = req.body.products;
                let { companyId } = req.user;
                if ((productArr === null || productArr === void 0 ? void 0 : productArr.length) > 1) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Only one product allowed now"));
                }
                let updateProductData = productArr[0];
                let productId = updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData._id;
                let names = [];
                productArr = (_a = productArr === null || productArr === void 0 ? void 0 : productArr.filter((it) => it && (it === null || it === void 0 ? void 0 : it.name))) === null || _a === void 0 ? void 0 : _a.map((it) => {
                    if (!it.slug)
                        names.push(it.name);
                    return Object.assign(Object.assign({}, it), { companyId: new mongodb_1.ObjectId(companyId) });
                });
                productArr = productArr === null || productArr === void 0 ? void 0 : productArr.map((it) => {
                    var _a;
                    if (!it.slug)
                        return Object.assign(Object.assign({}, it), { slug: (_a = names.find((st) => st.name === it.name)) === null || _a === void 0 ? void 0 : _a.slug });
                    else
                        it;
                });
                if (!productArr || !productArr.length) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not array / empty"));
                }
                let product = yield products_1.default.findById(productId);
                if (!product) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Invalid product id"));
                }
                let categoryId = updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.categoryId;
                if (categoryId) {
                    let category = yield category_1.default.findOne({
                        companyId,
                        _id: categoryId,
                    });
                    if (!category) {
                        return res.json((0, sendresponse_1.sendErrorResponse)("Invalid category id"));
                    }
                }
                if (!product.slug ||
                    (((_c = (_b = updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === null || _c === void 0 ? void 0 : _c.trim()) &&
                        ((_e = (_d = updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.name) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === null || _e === void 0 ? void 0 : _e.trim()) !==
                            ((_g = (_f = product === null || product === void 0 ? void 0 : product.name) === null || _f === void 0 ? void 0 : _f.toLowerCase()) === null || _g === void 0 ? void 0 : _g.trim()))) {
                    let slugValue = slug(updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.name);
                    slugValue = yield Products.checkAndUpdateSlug(slugValue, companyId);
                    updateProductData.slug = slugValue;
                }
                updateProductData = Products.addProductVersion(updateProductData);
                productArr[0] = updateProductData;
                if (updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.slug) {
                    yield Products.allForLoadingCache(companyId, updateProductData === null || updateProductData === void 0 ? void 0 : updateProductData.slug);
                }
                let products = yield Promise.all(productArr.map((it) => __awaiter(this, void 0, void 0, function* () {
                    let _id = it === null || it === void 0 ? void 0 : it._id;
                    if (!_id)
                        return { update: false, _id };
                    it === null || it === void 0 ? true : delete it._id;
                    let update = yield products_1.default.updateOne({ _id: _id }, Object.assign({}, it), {
                        upsert: true,
                    });
                    return { update: !!update.ok, _id: _id };
                })));
                if (product === null || product === void 0 ? void 0 : product.categoryId) {
                    (0, common_1.updateCategoryProduct)(product === null || product === void 0 ? void 0 : product.categoryId);
                }
                (0, common_1.updateCategoryProduct)(categoryId);
                return res.json((0, sendresponse_1.sendSuccessResponse)(products));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static addProductVersion(updateProductData) {
        updateProductData.productVersion = (0, uuid_1.v1)();
        return updateProductData;
    }
    static delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let productArr = req.body.products;
                let { companyId } = req.user;
                if (!productArr || !productArr.length) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("product not array / empty"));
                }
                let productId = productArr[0];
                let product = yield products_1.default.findById(productId);
                if (!product) {
                    return res.json((0, sendresponse_1.sendErrorResponse)("Invalid product id"));
                }
                let products = yield products_1.default.deleteMany({
                    _id: { $in: productArr },
                    companyId,
                });
                if (product === null || product === void 0 ? void 0 : product.categoryId) {
                    (0, common_1.updateCategoryProduct)(product === null || product === void 0 ? void 0 : product.categoryId);
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({ deletedCount: (products === null || products === void 0 ? void 0 : products.deletedCount) || 0 }));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = Products;
//# sourceMappingURL=index.js.map