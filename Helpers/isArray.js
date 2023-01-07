module.exports = function isArray(arr) {
  return arr && typeof arr === "object" && Array.isArray(arr);
};
