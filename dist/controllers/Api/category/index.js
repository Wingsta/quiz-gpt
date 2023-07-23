"use strict";
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
const sendresponse_1 = require("../../../services/response/sendresponse");
const category_1 = require("../../../models/category");
const utils_1 = require("./utils");
const products_1 = require("../../../models/products");
const constants_1 = require("../../../utils/constants");
class Categories {
    static getAllCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchTerm = req.query.searchTerm;
                let { companyId } = req.user;
                let { limit = 100000, offset = 0, sortBy = "createdAt", sortType = "asc", } = req.query;
                if (limit) {
                    limit = parseInt(limit.toString());
                }
                if (offset) {
                    offset = parseInt(offset.toString());
                }
                let mongoQuery = { companyId };
                if (searchTerm) {
                    searchTerm = (0, constants_1.replaceSpecialChars)(searchTerm);
                    mongoQuery["$or"] = [
                        { name: new RegExp(searchTerm, "i") }
                    ];
                }
                let category = yield category_1.default.find(mongoQuery)
                    // .sort([[sortBy, sortType === "asc" ? 1 : -1]])
                    .sort({
                    order: 1,
                    createdAt: -1
                })
                    .select({
                    name: 1,
                    productCount: 1,
                    createdAt: 1,
                    isActive: 1
                })
                    .skip(offset)
                    .limit(limit)
                    .lean();
                let count = yield category_1.default.countDocuments(mongoQuery);
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    category,
                    count
                }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static checkDuplicate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateDuplicateCategory)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { name, editId } = req.body;
                name = (0, constants_1.replaceSpecialChars)(name);
                let query = {
                    companyId: companyId,
                    name: new RegExp(`^${name}$`, 'i')
                };
                if (editId) {
                    query["_id"] = { $ne: editId };
                }
                let category = yield category_1.default.findOne(query);
                if (category) {
                    return res.json((0, sendresponse_1.sendSuccessResponse)({
                        exists: true
                    }, 'Category details'));
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)({
                    exists: false
                }, 'Category details'));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static createCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = (0, utils_1.validateCategory)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { name, isActive } = req.body;
                name = (0, constants_1.replaceSpecialChars)(name);
                let category = yield category_1.default.findOne({
                    companyId: companyId,
                    name: new RegExp(`^${name}$`, 'i')
                });
                if (category) {
                    return res.json((0, sendresponse_1.sendErrorResponse)(`${category === null || category === void 0 ? void 0 : category.name} already exists!`, 1234));
                }
                yield category_1.default.create({
                    name,
                    isActive,
                    companyId: companyId,
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Category created successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static editCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryId = req.params.categoryId;
                const { error } = (0, utils_1.validateCategory)(req.body);
                if (error) {
                    return res.status(400).send((0, sendresponse_1.sendErrorResponse)(error.details[0].message));
                }
                let { companyId } = req.user;
                let { name, isActive } = req.body;
                name = (0, constants_1.replaceSpecialChars)(name);
                let category = yield category_1.default.findOne({
                    companyId: companyId,
                    _id: categoryId
                });
                if (!category) {
                    return res.json((0, sendresponse_1.sendErrorResponse)(`Invalid category id!`));
                }
                category = null;
                category = yield category_1.default.findOne({
                    companyId: companyId,
                    name: new RegExp(`^${name}$`, 'i'),
                    _id: { $ne: categoryId }
                });
                if (category) {
                    return res.json((0, sendresponse_1.sendErrorResponse)(`${category === null || category === void 0 ? void 0 : category.name} already exists!`, 1234));
                }
                yield category_1.default.findByIdAndUpdate(categoryId, {
                    name,
                    isActive
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Category updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryId = req.params.categoryId;
                let { companyId } = req.user;
                yield category_1.default.findOneAndDelete({
                    companyId,
                    _id: categoryId
                });
                yield products_1.default.updateMany({ categoryId }, {
                    categoryId: null
                });
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Category deleted successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static sortCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categories = req.body.category;
                let { companyId } = req.user;
                let i, categoryUpdate = [];
                for (i = 0; i < categories.length; i++) {
                    categoryUpdate.push({
                        updateOne: {
                            filter: {
                                _id: categories[i]
                            },
                            update: {
                                order: i + 1
                            }
                        }
                    });
                }
                if (categoryUpdate.length > 0) {
                    yield category_1.default.bulkWrite(categoryUpdate);
                }
                return res.json((0, sendresponse_1.sendSuccessResponse)(null, "Category updated successfully!"));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = Categories;
//# sourceMappingURL=index.js.map