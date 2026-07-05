export const cvMessage = {
  CV_UPLOADED: {
    en: "CV uploaded successfully ✅",
    ar: "تم رفع السيرة الذاتية بنجاح ✅",
  },

  CV_CREATED: {
    en: "CV created successfully ✅",
    ar: "تم إنشاء السيرة الذاتية بنجاح ✅",
  },
  CV_UPDATED: {
    en: "CV updated successfully ✅",
    ar: "تم تحديث السيرة الذاتية بنجاح ✅",
  },

  CV_DELETED: {
    en: "CV deleted successfully ✅",
    ar: "تم حذف السيرة الذاتية بنجاح ✅",
  },

  CV_NOT_FOUND: {
    en: "CV not found ❌",
    ar: "السيرة الذاتية غير موجودة ❌",
  },

  CV_ALREADY_EXISTS: {
    en: "A CV with this title already exists ❕",
    ar: "توجد سيرة ذاتية بنفس العنوان بالفعل ❕",
  },

  INVALID_FILE_TYPE: {
    en: "Only PDF files are allowed ❌",
    ar: "يسمح فقط برفع ملفات PDF ❌",
  },

  FILE_TOO_LARGE: {
    en: "File size exceeds the allowed limit ❌",
    ar: "حجم الملف يتجاوز الحد المسموح ❌",
  },

  UPLOAD_URL_CREATED: {
    en: "Upload URL generated successfully ✅",
    ar: "تم إنشاء رابط الرفع بنجاح ✅",
  },

  CV_UPLOAD_FAILED: {
    en: "Failed to upload CV ❌",
    ar: "فشل في رفع السيرة الذاتية ❌",
  },

  CV_PARSE_FAILED: {
    en: "Failed to extract text from CV ❌",
    ar: "فشل في استخراج النص من السيرة الذاتية ❌",
  },

  CV_ACCESS_DENIED: {
    en: "You are not allowed to access this CV ❌",
    ar: "غير مصرح لك بالوصول إلى هذه السيرة الذاتية ❌",
  },
} as const;

export type CvMessageKey = keyof typeof cvMessage;