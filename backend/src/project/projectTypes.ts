import { User } from "../user/userTypes";

export interface Project {
  _id: string;
  title: string;
  img: string[];
  userId: User;
  location:number[];
  address: string;
  status: string;
  type: string;
  description:string;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
}