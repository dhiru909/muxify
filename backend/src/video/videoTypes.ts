
import { User } from '../user/userTypes';

export interface Video  {
  _id: string;
  title: string;
  url: string;
  etag: string;
  user: User;
  transcodedUrls: {
    _360p: string;
    _480p: string;
    _720p: string;
    _1080p: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
