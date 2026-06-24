import { RelationKeys } from "../types/definitions.js";
import { Users } from "../generated/browser.js";

export const generateRandomString = (): string => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const allChars = lower + upper + numbers;

  const hasLower = /[a-z]/;
  const hasUpper = /[A-Z]/;
  const hasNumber = /[0-9]/;

  let result = "";

  while (true) {
    result = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      result += allChars[randomIndex];
    }

    if (
      hasLower.test(result) &&
      hasUpper.test(result) &&
      hasNumber.test(result)
    ) {
      break;
    }
  }

  return result;
};

export const getRelationKey = (obj: Users | {}): RelationKeys | undefined => {
  const relationKeys: RelationKeys[] = [
    "admins",
    "students",
    "staffs",
    "guardians",
  ];
  const key = relationKeys.find(
    (relationKey: RelationKeys) => relationKey in obj,
  );
  return key;
};
