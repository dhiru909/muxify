"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.videoSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: false,
    },
    etag: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transcodedUrls: {
        _360p: String,
        _480p: String,
        _720p: String,
        _1080p: String,
    },
    status: {
        type: String,
        required: true,
        enum: ['UPLOADING', 'UPLOADED', 'TRANSCODING', 'TRANSCODED'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("Video", exports.videoSchema);
