/**
 * Define interface for Account User Model
 *
 * @author Vishal <vishal@vishhh.com>
 */
import { Types } from "mongoose";


export interface IAccountUser {
  _id: Types.ObjectId;
  email: string;

  phoneNumber: string;
  firstName: string;
  lastName: string;
  country: string;
  password : string;
  status : 'PAID' | 'TRIAL' | 'DEACTIVATED'
  
}
