var FIELDS = {
  id: "_tree_id",
  parent: "_tree_parent",
  children: "children"
};

function toTable(tree, childrenField, idField, parentField) {
  childrenField = childrenField || FIELDS.children;
  idField = idField || FIELDS.id;
  parentField = parentField || FIELDS.parent;
  var list = [];
  var id = 0;
  
  function visit(node, parentId) {
    var nid = node[idField] = id++;
    node[parentField] = parentId;
    list.push(node);
    
    var children = node[childrenField];
    if (children) {
      for (var i=0; i<children.length; ++i) {
        visit(children[i], nid);
      }
    }
  }
  
  visit(tree, -1);
  return list;
}

function fromTable(list, childrenField, idField, parentField) {
  childrenField = childrenField || FIELDS.children;
  idField = idField || FIELDS.id;
  parentField = parentField || FIELDS.parent;
  var root = null;
  
  list.forEach(function(node) {
    if (node[childrenField]) {
      node[childrenField] = null;
    };
  })
  
  list.forEach(function(node) {
    var pid = node[parentField];
    if (pid === -1) {
      root = node;
    } else {
      var p = nodes[pid];
      var children = p[childrenField] || (p[childrenField] = []);
      children.push(node);
    }
  });

  return root;
}

module.exports = {
  toTable: toTable,
  fromTable: fromTable,
  fields: FIELDS
};