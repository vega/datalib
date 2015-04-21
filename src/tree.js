var FIELDS = {
  parent: "parent",
  children: "children"
};

function toTable(root, childrenField, parentField) {
  childrenField = childrenField || FIELDS.children;
  parentField = parentField || FIELDS.parent;
  var table = [];
  
  function visit(node, parent) {
    node[parentField] = parent;
    table.push(node);
    
    var children = node[childrenField];
    if (children) {
      for (var i=0; i<children.length; ++i) {
        visit(children[i], node);
      }
    }
  }
  
  visit(root, null);
  return (table.root = root, table);
}

module.exports = {
  toTable: toTable,
  fields: FIELDS
};