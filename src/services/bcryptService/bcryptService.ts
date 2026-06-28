import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger.js';

export const hash = async (data: string): Promise<string> => {
  try {
    const defaultPassword = await bcrypt.hash(data, 9);
    return defaultPassword;
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : String(error) },
      'Bcrypt Error',
    );
    throw new Error('Could not process password securely');
  }
};

export const compare = async (paylaod: string, storedPassword: string): Promise<boolean> => {
  try {
    const passwordValid = await bcrypt.compare(paylaod, storedPassword);
    return passwordValid;
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : String(error) },
      'Bcrypt Error',
    );
    throw new Error('Could not process password securely');
  }
};
