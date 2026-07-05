import { messages } from './messages';
import { Language } from './language.type';

export class Translator {
  static auth(
    key: keyof typeof messages.auth,
    lang: Language = 'en',
  ) {
    return messages.auth[key][lang];
  }

  static user(
    key: keyof typeof messages.user,
    lang: Language = 'en',
  ) {
    return messages.user[key][lang];
  }

  static cv(
    key: keyof typeof messages.cv,
    lang: Language = 'en',
  ) {
    return messages.cv[key][lang];
  }

  static validation(
    key: keyof typeof messages.validation,
    lang: Language = 'en',
  ) {
    return messages.validation[key][lang];
  }
}