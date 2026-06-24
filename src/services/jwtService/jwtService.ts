import jwt, { JwtPayload } from "jsonwebtoken";
import { RelationKeysMap } from "../../types/definitions.js";
import { logger } from "../../utils/logger.js";

export const sign = (
  data: RelationKeysMap,
  expireIn: number = 86400,
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      data,
      process.env.JWT_SECRET as string,
      { expiresIn: expireIn },
      (error, token) => {
        if (error) {
          return logger.error({ message: error.message }, "JWT Error");
        }
        if (!token) {
          return logger.error(
            { message: "Token generation failed: Token is undefined" },
            "JWT Error",
          );
        }
        resolve(token);
      },
    );
  });
};

export const verify = (token: string | undefined): {} => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
      (error, decoded) => {
        if (error) {
          return logger.error({ message: error.message }, "JWT Error");
        }

        // Typecast the safely verified payload to your custom interface
        resolve(decoded as any);
      },
    );
  });
};
