var contadorNodos = 0;

const COLOR_CURRENT_NODE = "green";
const COLOR_DISABLED_NODE = "gray";
const COLOR_OPEN_NODE = "blue";

var treeData = [{
    "ident": contadorNodos,
    "name": contadorNodos + ": MAIN",
    "parent": null,
    "color": COLOR_CURRENT_NODE,
    "recursive": false,
    "data": ""
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
        .on("mouseenter", hover)
        .on("mouseleave", removeHover)

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
            return d.color;
        })
        .style("stroke-width", function (d) {
            if(d.recursive) {
                return '5px';
            }
            return "";
        })
        .style("stroke-dasharray", function (d) {
            if(d.recursive) {
                return 2;
            }
            return "";
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
        })
        .style("stroke-width", function (d) {
            if(d.recursive) {
                return '5px';
            }
            return "";
        })
        .style("stroke-dasharray", function (d) {
            if(d.recursive) {
                return 2;
            }
            return "";
        });;

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


function hover(d) {
    var div = document.getElementById('divCard');   
    div.style.position = "absolute";
    div.style.left = (d.y+10)+'px';
    div.style.top = (d.x+40)+'px';
    div.style.display = "inline-block";
    document.getElementById('textCard').innerHTML= d.data;
}

function changeText(newText){
    headTree.data = newText;
}

function removeHover(d) {
    //window.clearTimeout();
    document.getElementById('divCard').style.display = "none";
}

function addCircle(text, nameSubRutina,recursive) {
    contadorNodos++;
    var newCircle = {
        "ident": contadorNodos,
        "name": contadorNodos + ": " + nameSubRutina,
        "parent": headTree.name,
        "color": COLOR_CURRENT_NODE,
        "recursive": recursive,
        "data": text
    }
    if (typeof headTree.children == "undefined") {
        headTree.children = [newCircle];
    } else {
        headTree.children.push(newCircle);
    }
    headTree.color = COLOR_OPEN_NODE;
    headTree = newCircle;
    update(treeData[0]);
}

function devolverPaso(){
    if(typeof headTree.children == "undefined"){
        if(headTree.parent != null){
            headTree = headTree.parent;
            if(headTree.children.length>1){
                headTree.children.splice(headTree.children.length-1, 1);
            }else{
                delete headTree['children'];
            }
            contadorNodos--;
            headTree.color = COLOR_CURRENT_NODE;
        }
    }else{
        headTree.color = COLOR_OPEN_NODE;
        headTree = headTree.children[headTree.children.length-1];
        headTree.color = COLOR_CURRENT_NODE;
    }
    update(treeData[0]);
}

function disableCircle() {
    if(headTree.parent != null){
        headTree.color = COLOR_DISABLED_NODE;
        update(treeData[0]);
        headTree = headTree.parent;
        headTree.color = COLOR_CURRENT_NODE;
        update(treeData[0]);
    }
}

function resetTree() {
    if (treeData[0].children) {
        delete treeData[0].children;
        treeData[0].color = COLOR_CURRENT_NODE;
        headTree = treeData[0];
        contadorNodos = 0;
        update(treeData[0]);
    }
}

function searchTree(element, id){
    if(element.ident == id){
         return element;
    }else if (typeof element.children != "undefined"){
         var i;
         var result = null;
         for(i=0; result == null && i < element.children.length; i++){
              result = searchTree(element.children[i], id);
         }
         return result;
    }
    return null;
}

function deleteNode(number){
    var node = searchTree(treeData[0],number);
    if(node){
        if(node.color == COLOR_CURRENT_NODE){
            node.parent.color = COLOR_CURRENT_NODE;
        }
        var nodePatern = node.parent;
        if(nodePatern.children.length>1){
            for(var i =0; i< nodePatern.children.length; i++){
                if(nodePatern.children[i].ident == number){
                    nodePatern.children.splice(i, 1);
                    break;
                }
            }
        }else{
            delete nodePatern['children'];
        }
        update(treeData[0]);
    }
}

function getTree(){
    return treeData.slice(0);
}
