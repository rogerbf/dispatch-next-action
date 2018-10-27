const { NODE_ENV } = process.env

module.exports = {
  testRegex:
    NODE_ENV === `development`
      ? `(/tests/.*\\.spec.js)$`
      : `tests/index.spec.js`,
}
