import mongoose from "mongoose";
import { User } from "./userTypes";
enum Role{
  ADMIN = "ADMIN",
  USER = "USER"
}
const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dp:{
      type: String,
      required: false,
    },
    role:{
      type:Role,
      default:Role.USER
    },
    

  },
  { timestamps: true }
);

export default mongoose.model<User>("User", userSchema);
