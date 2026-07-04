import { authMessage } from './auth.message';
import { userMessage } from './user.message';
import { validationMessage } from './validation.message';

export const messages = {
  auth: authMessage,
  user: userMessage,
  validation: validationMessage,
} as const;