import * as nodemailer from "nodemailer";
import { SignupSchoolInput } from "../../middleware/zodvalidate/schema/school/schoolSchemas.js";
import { logger } from "../../utils/logger.js";
import { Users } from "../../generated/browser.js";
import { crateSchoolTemplate } from "./emailTemplates/createSchoolTemplates.js";
import { forgotPasswordTemplate } from "./emailTemplates/forgotPasswordTemplate.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL_USER,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },
});

export const schoolCreatedMail = (
  data: SignupSchoolInput,
  urlData: { token: string },
) => {
  const createSchoolMailOptions = {
    from: '"Danira Admin" <no-reply@danira.com>',
    to: `${data.schoolData.email}`,
    subject: "Your School Account is ready",
    html: crateSchoolTemplate(data, urlData),
  };
  transporter.sendMail(createSchoolMailOptions, (error, info) => {
    if (error) {
      logger.error({ message: error.message }, "Mail not delivered");
    } else {
      logger.info({ message: info.envelope }, "Mail delivered");
    }
  });
};

export const forgotPasswordMail = (data: Users, urlData: { token: string }) => {
  const forgotPasswordMailOptions = {
    from: '"Danira Admin" <no-reply@danira.com>',
    to: `${data.email}`,
    subject: "Reset Your Password",
    html: forgotPasswordTemplate(data, urlData),
  };
  transporter.sendMail(forgotPasswordMailOptions, (error, info) => {
    if (error) {
      logger.error({ message: error.message }, "Mail not delivered");
    } else {
      logger.info({ message: info.envelope }, "Mail delivered");
    }
  });
};
