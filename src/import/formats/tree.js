var TREE_KEY = '__tree_data__';

function isTree(obj) {
  return obj && obj[TREE_KEY];
}

function makeTree(obj, children) {
  var d = [obj];
  d[TREE_KEY] = true;
  d.children = children || "children";
  return d;
}

module.exports = {
  isTree: isTree,
  makeTree: makeTree
};

