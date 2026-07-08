import { type Request, type Response, type NextFunction } from 'express';

export const loggedInUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req);
};
