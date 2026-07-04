export const userMessage = {
  USER_NOT_FOUND: {
    en: 'User not found❕',
    ar: 'المستخدم غير موجود❕',
  },

  PROFILE_UPDATED: {
    en: 'Profile updated successfully✅',
    ar: 'تم تحديث الملف الشخصي بنجاح✅',
  },

  ACCOUNT_DELETED: {
    en: 'Account deleted successfully ✅',
    ar: 'تم حذف الحساب بنجاح ✅',
  },

  LANGUAGE_UPDATED: {
    en: 'Language updated successfully✅',
    ar: 'تم تحديث اللغة بنجاح✅',
  },
  EMAIL_UPDATED: {
    en: 'Email updated successfully✅',
    ar: 'تم تحديث البريد الإلكتروني بنجاح✅',
  },

  PHONE_UPDATED: {
    en: 'Phone updated successfully✅',
    ar: 'تم تحديث رقم الهاتف بنجاح✅',
  },

  USER_ALREADY_EXISTS: {
    en: 'User already exists❕',
    ar: 'المستخدم موجود بالفعل❕',
  },

  PROFILE_IMAGE_UPDATED: {
    en: 'Profile image updated successfully✅',
    ar: 'تم تحديث صورة الملف الشخصي بنجاح✅',
  },
  ACCOUNT_NOT_FOUND:{
    en :"Account not found ❌" ,
    ar:"الحساب غير موجود ❌"
  }









} as const;

export type UserMessageKey = keyof typeof userMessage;