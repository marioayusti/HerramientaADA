const COLOR_CURRENT_NODE = "green";
const COLOR_DISABLED_NODE = "gray";
const COLOR_OPEN_NODE = "blue";

var treeData = [{
    "ident": 0,
    "name": 0,
    "parent": null,
    "color": COLOR_CURRENT_NODE,
}];


var headTree = treeData[0];


// ************** Generate the tree diagram	 *****************
var margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
},
    width = 1960 - margin.right - margin.left,
    height = 750 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.y, d.x];
    });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var nodeEnter;

root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;

update(root);

d3.select(self.frameElement).style("height", "500px");

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.

    var newNodePositionY;
    var newNodePositionX;
    var newNodeData;
    nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            newNodePositionY = d.y;
            newNodePositionX = d.x;
            newNodeData = d.data;
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', openForm);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
            return d.color;
        });

    nodeEnter.append("text")
        .attr("x", function (d) {
            return d.children || d._children ? -13 : 15;
        })
        .attr("y", function (d) {
            return d.children || d._children ? -9 : 0;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
        })
        .attr("id", function (d) {
            return 'textId_' + d.id;
        })
        .text(function (d) {
            return String(d.name);
        })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) {
            return d.color;
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("newCirclecircle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function addCircle(idNode) {
    number = document.getElementById("idNodeInput").value;
    alertify.alert().destroy();
    if (isNumberValid(number)) {
        var node = searchTree(treeData[0], idNode);
        if (node) {
            headTree.color = COLOR_OPEN_NODE;
            headTree = node;
            var newCircle = {
                "ident": number,
                "name": number,
                "parent": headTree.name,
                "color": COLOR_CURRENT_NODE
            }
            if (typeof headTree.children == "undefined") {
                headTree.children = [newCircle];
            } else {
                headTree.children.push(newCircle);
            }
            headTree = newCircle;
            update(treeData[0]);
        }
    } else {
        alertify.error('Por favor ingrese un número positivo válido');
    }
}

function disableCircle() {
    if (headTree.parent != null) {
        headTree.color = COLOR_DISABLED_NODE;
        update(treeData[0]);
        headTree = headTree.parent;
        headTree.color = COLOR_CURRENT_NODE;
        update(treeData[0]);
    }
}

function resetTree() {
    document.getElementById('textId_1').innerHTML = "0";
    treeData[0].name = 0;
    treeData[0].ident = 0;
    if (treeData[0].children) {
        delete treeData[0].children;
        treeData[0].color = COLOR_CURRENT_NODE;
        headTree = treeData[0];
        update(treeData[0]);
    }
}

function searchTree(element, id) {
    if (element.ident == id) {
        return element;
    } else if (typeof element.children != "undefined") {
        var i;
        var result = null;
        for (i = 0; result == null && i < element.children.length; i++) {
            result = searchTree(element.children[i], id);
        }
        return result;
    }
    return null;
}

function EditCircle(idNode, id) {
    var number = parseInt(document.getElementById("idNodeEditInput").value);
    alertify.alert().destroy();
    if (isNumberValid(number)) {
        var node = searchTree(treeData[0], idNode);
        if (node) {
            node.ident = number;
            node.name = number;
            document.getElementById('textId_' + id).innerHTML = number + "";
        }
    } else {
        alertify.error('Por favor ingrese un número positivo válido');
    }
}

function deleteNode(idNode) {
    var number = idNode;
    alertify.alert().destroy();
    if (isNumberValid(number)) {
        var node = searchTree(treeData[0], number);
        if (node) {
            if (node.parent != null) {
                if (node.color == COLOR_CURRENT_NODE) {
                    node.parent.color = COLOR_CURRENT_NODE;
                }
                var nodePatern = node.parent;
                if (nodePatern.children.length > 1) {
                    for (var i = 0; i < nodePatern.children.length; i++) {
                        if (nodePatern.children[i].ident == number) {
                            nodePatern.children.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    delete nodePatern['children'];
                }
                update(treeData[0]);
            } else {
                alertify.error('No puede eliminar la raíz, si lo desea, reinicie el juego!');
            }

        }
    } else {
        alertify.error('Por favor ingrese un número positivo válido');
    }
}

function openForm(d) {
    console.log(d, d.id);
    alertify.alert('¿Qué quieres hacer?',
        '<div class="container-fluid">' +
        '<div class="row">' +
        '<div class="col-md-4" style="width:33%;text-align:center">' +
        '<h5>' +
        'Agregar un nodo' +
        '</h5>' +
        '<input id="idNodeInput" type="number" class="form-control" placeholder="Ingrese el id">' +
        '<br><button type="button" class="btn btn-success" style="margin-left: 5px" onclick="addCircle(' + d.ident + ')">Agregar nodo</button>' +
        '</div>' +
        '<div class="col-md-4" style="width:33%;text-align:center">' +
        '<h5>' +
        'Editar nodo actual' +
        '</h5>' +
        '<input id="idNodeEditInput" type="number" class="form-control" placeholder="Ingrese el id" value="' + d.ident + '">' +
        '<br><button type="button" class="btn btn-primary" style="margin-left: 5px" onclick="EditCircle(' + d.ident + ',' + d.id + ')">Editar nodo</button>' +
        '</div>' +
        '<div class="col-md-4" style="width:33%;text-align:center">' +
        '<br><br><h5>' +
        'Eliminar Nodo' +
        '</h5>' +
        '<button type="button" class="btn btn-danger" onclick="deleteNode(' + d.ident + ')">Eliminar nodo</button>' +
        '</div>' +
        '</div>' +
        '</div>').setting({
            'label': 'Cancelar',
        }).show();;
}

function getTree() {
    return treeData.slice(0);
}

function isNumberValid(number) {
    if (number != '' && (number + '').length > 0 && number >= 0) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    }
    return false;
}

function testCompare() {
    var original = [
        {
            "ident": 0,
            "name": 0,
            "parent": null,
            "children": [{
                "ident": 1,
                "name": 1,
                "parent": null,
                "color": COLOR_OPEN_NODE,
                "children": [{
                    "ident": 2,
                    "name": 2,
                    "parent": null,
                    "color": COLOR_OPEN_NODE,
                }, {
                    "ident": 3,
                    "name": 3,
                    "parent": null,
                    "color": COLOR_CURRENT_NODE,
                }],
            }],
            "color": COLOR_OPEN_NODE
        }
    ];

    var user = [
        {
            "ident": 0,
            "name": 0,
            "parent": null,
            "children": [{
                "ident": 1,
                "name": 1,
                "parent": null,
                "color": COLOR_OPEN_NODE,
                "children": [{
                    "ident": 2,
                    "name": 2,
                    "parent": null,
                    "color": COLOR_OPEN_NODE,
                }, {
                    "ident": 3,
                    "name": 3,
                    "parent": null,
                    "color": COLOR_CURRENT_NODE,
                }],
            }],
            "color": COLOR_OPEN_NODE
        }
    ];
    console.log(compareTree(original[0], user[0]));
}

function compareTree(treeOriginal, treeUser) {
    if (treeOriginal.ident == treeUser.ident) {
        if (typeof treeOriginal.children == "undefined" && typeof treeUser.children == "undefined") {
            return true;
        } else if (typeof treeOriginal.children != "undefined" && typeof treeUser.children != "undefined" &&
            treeOriginal.children.length == treeUser.children.length) {
            var result = true;
            for (let i = 0; result && i < treeOriginal.children.length; i++) {
                result = compareTree(treeOriginal.children[i], treeUser.children[i]);
            }
            return result;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function countTreeNodes(treeOriginal) {
    var result = 1;
    if (typeof treeOriginal.children != "undefined") {
        for (let i = 0; i < treeOriginal.children.length; i++) {
            result += countTreeNodes(treeOriginal.children[i]);
        }
    }
    return result;
}
