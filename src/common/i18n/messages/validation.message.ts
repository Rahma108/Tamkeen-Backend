export const validationMessage = {
  REQUIRED: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },

  INVALID_EMAIL: {
    en: 'Invalid email address',
    ar: 'البريد الإلكتروني غير صحيح',
  },

  INVALID_PHONE: {
    en: 'Invalid phone number',
    ar: 'رقم الهاتف غير صحيح',
  },

  PASSWORD_TOO_WEAK: {
    en: 'Password is too weak',
    ar: 'كلمة المرور ضعيفة',
  },

  PASSWORDS_NOT_MATCH: {
    en: 'Passwords do not match',
    ar: 'كلمتا المرور غير متطابقتين',
  },

  INVALID_OTP: {
    en: 'Invalid OTP',
    ar: 'رمز التحقق غير صحيح',
  },
  FILE_SIZE_EXCEEDED:{
    en: "Image size must not exceed 2 MB.",
    ar: "حجم الصورة يجب ألا يتجاوز 2 ميجابايت.",
  }
} as const;

export type ValidationMessageKey = keyof typeof validationMessage;