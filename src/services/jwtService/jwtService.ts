import jwt from "jsonwebtoken";
import { RelationKeysMap } from "../../types/definitions.js";

export const sign = (
  data: RelationKeysMap,
  expireIn: number = 86400,
): string => {
  const token = jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: expireIn,
  });
  return token;
};

export const verify = (token: string | undefined): {} => {
  const verified: any = jwt.verify(
    token as string,
    process.env.JWT_SECRET as string,
    (err, decoded) => {
      if (err) {
        console.log(err);
      }
      if (decoded) return decoded;
    },
  );
  return verified;
};
