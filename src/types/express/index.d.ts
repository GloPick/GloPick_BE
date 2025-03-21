import { UserDocument } from "../../../src/models/User"; // 경로 주의!

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
