import express from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { globalErrorHandler } from './middleware/errorHandler/globalErrorHandler.js';

const app = express();
const PORT = process.env.SERVER_PORT;

import daniraRoute from './routes/danira/daniraRouter.js';
import authRouter from './routes/auth/authRouter.js';
import userRouter from './routes/user/userRouter.js';
import feeRouter from './routes/fee/feeRouter.js';
import schoolRouter from './routes/school/schoolRouter.js';
import classRouter from './routes/class/classRouter.js';
import staffRouter from './routes/staff/staffRouter.js';
import subjectRouter from './routes/subject/subjectRouter.js';
import studentRouter from './routes/student/studentRouter.js';
import timetableRouter from './routes/timetable/timetableRouter.js';
import attendanceRouter from './routes/attendance/attendanceRouter.js';
import notificationRouter from './routes/notification/notificationRouter.js';
import assessmentRouter from './routes/assessment/assessmentRouter.js';
import paymentRouter from './routes/payment/paymentRouter.js';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(pinoHttp({ logger }));

app.use('/danira', daniraRoute);

app.use('/user', userRouter);

app.use('/attendance', attendanceRouter);

app.use('/school', schoolRouter);

app.use('/fee', feeRouter);

app.use('/payment', paymentRouter);

app.use('/subject', subjectRouter);

app.use('/class', classRouter);

app.use('/staff', staffRouter);

app.use('/assessment', assessmentRouter);

app.use('/timetable', timetableRouter);

app.use('/student', studentRouter);

app.use('/notification', notificationRouter);

app.use('/auth', authRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`SERVER IS UP ON PORT ${PORT}`);
});
