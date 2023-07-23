"use strict";
/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = void 0;
const Database_1 = require("../providers/Database");
const mongoose_1 = require("mongoose");
// Create the model schema & register your custom methods here
// Define the User Schema
exports.PostSchema = new Database_1.default.Schema({
    name: { type: String },
    id: { type: String },
    media_type: { type: String },
    image_url: { type: Array },
    caption: { type: String },
    createdTime: { type: Date },
    companyId: { type: mongoose_1.Types.ObjectId },
}, {
    timestamps: true,
});
const Post = Database_1.default.model("Post", exports.PostSchema);
exports.default = Post;
//# sourceMappingURL=posts.js.map