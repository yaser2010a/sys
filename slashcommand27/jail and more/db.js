// قاعدة بيانات بسيطة في الذاكرة لحفظ رتب المسجونين
const savedRoles = new Map();
const violations = new Map();

module.exports = {
  // حفظ رتب عضو
  saveRoles(userId, roleIds) {
    savedRoles.set(userId, roleIds);
  },

  // جلب رتب عضو
  getRoles(userId) {
    return savedRoles.get(userId) || [];
  },

  // حذف رتب عضو
  deleteRoles(userId) {
    savedRoles.delete(userId);
  },

  // تحقق إذا العضو مسجون (عنده رتب محفوظة)
  isJailed(userId) {
    return savedRoles.has(userId);
  },

  // نظام المخالفات
  addViolation(userId) {
    const count = (violations.get(userId) || 0) + 1;
    violations.set(userId, count);
    return count;
  },
  resetViolations(userId) {
    violations.delete(userId);
  },
};
