import mongoose from "mongoose";
import {Video} from "./videoTypes"
export const videoSchema = new mongoose.Schema<Video>(
  {
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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true },
);


export default mongoose.model<Video>("User", videoSchema);