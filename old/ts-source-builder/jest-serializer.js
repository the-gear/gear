module.exports = {
  test: (val) => val.getSource || val.getTsCode,
  print: (val) => val.toString(),
};
