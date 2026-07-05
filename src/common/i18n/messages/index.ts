import { authMessage } from './auth.message';
import { cvMessage } from './cv.message';
import { userMessage } from './user.message';
import { validationMessage } from './validation.message';

export const messages = {
  auth: authMessage,
  user: userMessage,
  cv :cvMessage,
  validation: validationMessage,
} as const;