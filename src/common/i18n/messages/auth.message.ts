export const authMessage = {
  // Success
  SIGNUP_SUCCESS: {
    en: 'Account created successfully. Please verify your email 📩',
    ar: 'تم إنشاء الحساب بنجاح، يرجى تأكيد بريدك الإلكتروني 📩',
  },

  LOGIN_SUCCESS: {
    en: 'Login successful ✅',
    ar: 'تم تسجيل الدخول بنجاح ✅',
  },

  GOOGLE_SIGNUP_SUCCESS: {
    en: 'Google account created successfully 🎉',
    ar: 'تم إنشاء الحساب باستخدام جوجل بنجاح 🎉',
  },

  GOOGLE_LOGIN_SUCCESS: {
    en: 'Google login successful 🔐',
    ar: 'تم تسجيل الدخول بواسطة جوجل بنجاح 🔐',
  },

  EMAIL_CONFIRMED: {
    en: 'Email confirmed successfully ✔️',
    ar: 'تم تأكيد البريد الإلكتروني بنجاح ✔️',
  },

  CONFIRMATION_CODE_SENT: {
    en: 'Verification code sent successfully 📩',
    ar: 'تم إرسال رمز التحقق بنجاح 📩',
  },

  FORGOT_PASSWORD_CODE_SENT: {
    en: 'Password reset code sent successfully 📩',
    ar: 'تم إرسال رمز إعادة تعيين كلمة المرور 📩',
  },

  OTP_VERIFIED: {
    en: 'OTP verified successfully ✅',
    ar: 'تم التحقق من رمز التأكيد بنجاح ✅',
  },

  PASSWORD_RESET_SUCCESS: {
    en: 'Password reset successfully 🔑',
    ar: 'تم إعادة تعيين كلمة المرور بنجاح 🔑',
  },

  PASSWORD_CHANGED: {
    en: 'Password changed successfully 🔐',
    ar: 'تم تغيير كلمة المرور بنجاح 🔐',
  },

  LOGOUT_SUCCESS: {
    en: 'Logged out successfully ',
    ar: 'تم تسجيل الخروج بنجاح ',
  },

  // Errors

  EMAIL_ALREADY_EXISTS: {
    en: 'Email already exists ❕',
    ar: 'البريد الإلكتروني مستخدم بالفعل ❕',
  },

  INVALID_CREDENTIALS: {
    en: 'Invalid email or password ❌',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة ❌',
  },

  ACCOUNT_NOT_FOUND: {
    en: 'Account not found ❕',
    ar: 'الحساب غير موجود ❕',
  },

  EMAIL_NOT_CONFIRMED: {
    en: 'Please confirm your email first 📩',
    ar: 'يرجى تأكيد البريد الإلكتروني أولاً 📩',
  },

  INVALID_OTP: {
    en: 'Invalid OTP ❌',
    ar: 'رمز التحقق غير صحيح ❌',
  },

  OTP_EXPIRED: {
    en: 'OTP has expired ⏳',
    ar: 'انتهت صلاحية رمز التحقق ⏳',
  },

  INVALID_TOKEN: {
    en: 'Invalid token ❌',
    ar: 'الرمز غير صالح ❌',
  },

  TOKEN_EXPIRED: {
    en: 'Token expired ⏳',
    ar: 'انتهت صلاحية الرمز ⏳',
  },

  GOOGLE_ACCOUNT_NOT_VERIFIED: {
    en: 'Google account is not verified ',
    ar: 'حساب جوجل غير موثق ',
  },

  GOOGLE_TOKEN_INVALID: {
    en: 'Invalid Google token ❌',
    ar: 'رمز جوجل غير صالح ❌',
  },
  ACCOUNT_ALREADY_EXISTS_WITH_DIFFERENT_PROVIDER: {
    en: 'Account already exists with another provider ',
    ar: 'الحساب موجود بالفعل باستخدام مزود تسجيل دخول آخر ',
  },

  OTP_REQUEST_BLOCKED: {
    en: 'Maximum OTP requests reached ⛔',
    ar: 'تم تجاوز الحد الأقصى لطلبات رمز التحقق ⛔',
  },

  OTP_ALREADY_SENT: {
    en: 'OTP already sent ⏳',
    ar: 'تم إرسال رمز تحقق بالفعل ⏳',
  },

  USER_CREATION_FAILED: {
    en: 'Failed to create account ❌',
    ar: 'فشل إنشاء الحساب ❌',
  },
  ACCESS_TOKEN_STILL_VALID: {
  en: 'Current access token is still valid ⏳',
  ar: 'رمز الوصول الحالي ما زال صالحًا ⏳',
},

} as const;