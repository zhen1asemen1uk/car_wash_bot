import { ObjectId } from "mongodb";

export interface IAnswers {
  [key: string]: string | number | Date | ObjectId;
}

export interface IQuestion {
  key: string;
  question: string;
}
