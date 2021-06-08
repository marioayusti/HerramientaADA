/// <reference path="VisuData.js" />
/// <reference path="VisuVariable.js" />

/*
*
* Copyright (c) 2015- Ladislav Vegh, Komarno, Slovakia
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*
*/

var inalan = inalan || {};

inalan.VisuArray = function (name, values, changeable) {
    if (typeof (changeable) == "undefined") {
        changeable = false;
    }
    // create subclass VisuArray from VisuData - set properties
    inalan.VisuData.call(this);
    this.name = name;
    // create VisuVariables as VisuArray elements
    this.length = values.length;
    for (var i = 0; i < values.length; i++) {
        this[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i], changeable);
        this[i].textRotation = 45;
    }
    // set indexes
    this.showIndexes = true; // show index numbers under the array
    this.indexes = {};
    this.loopMarks = {};
    this.markers = []; // horizontal lines (marked parts of array) under the indexes
    this.indexesPos = 0;
    this.indexStrokeColor = "#CDD";
    this.indexFillColor = "#DEE";
    this.loopMarkStrokeColor = "#D8E8E8";
    this.loopMarkFillColor = "#FAFAFA";
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

// randomize the array
inalan.VisuArray.prototype.randomize = function (min, max) {
    for (var i = 0; i < this.length; i++) {
        this[i].randomize(min, max);
    }
}

// add/set index to the VisuArray
inalan.VisuArray.prototype.setIndex = function (name, value, pos) {
    if (typeof (pos) == "undefined") {
        pos = -1;
    }
    this.indexes[name] = { "value": value, "pos": pos };
}
// delete index from VisuArray
inalan.VisuArray.prototype.deleteIndex = function (name) {
    delete (this.indexes[name]);
    delete (this.loopMarks[name]);
}

inalan.VisuArray.prototype.deleteAllIndexes = function () {
    this.indexes = {};
    this.loopMarks = {};
}

// add/set loopMarker to the VisuArray
inalan.VisuArray.prototype.setLoopMarker = function (indexName, from, to, backward) {
    this.loopMarks[indexName] = { "from": from, "to": to, "backward": backward };
}
// delete loopMarker from VisuArray
inalan.VisuArray.prototype.deleteLoopMarker = function (indexName) {
    delete (this.loopMarks[indexName]);
}

// add/set Marker to the VisuArray
inalan.VisuArray.prototype.setMarker = function (from, to, color) {
    var n = this.markers.length;
    var found = false;
    for (var i = 0; i < n; i++) {
        if (this.markers[i].from == from && this.markers[i].to == to) {
            found = true;
            this.markers[i].color = color;
        }
    }
    if (!found) {
        this.markers[n] = { "from": from, "to": to, "color": color };
    }
}
// delete Marker from VisuArray
inalan.VisuArray.prototype.deleteMarker = function (from, to) {
    var n = this.markers.length;
    var foundPlace = -1;
    for (var i = 0; i < n; i++) {
        if (this.markers[i].from == from && this.markers[i].to == to) {
            foundPlace = i;
        }
    }
    if (foundPlace >= 0) {
        this.markers.splice(foundPlace, 1);
    }
}

inalan.VisuArray.prototype.deleteAllMarkers = function () {
    this.markers = [];
}

// redner the array by calling the render function of every element (visuVariable)
inalan.VisuArray.prototype.render = function () {
    // render VisuArray
    var maxHeight = this[0].height;
    for (var i = 0; i < this.length; i++) {
        if (this[i].height > maxHeight) {
            maxHeight = this[i].height;
        }
    }
    var xpos = this.x;
    // write the numbers above indexes
    if (this.showIndexes || Object.keys(this.indexes).length > 0) {
        this.ctx.fillStyle = "#BBB";
        this.ctx.font = "bold 12px Courier New";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "alphabetic";
        for (var k = 0; k < this.length; k++) {
            this.ctx.fillText(k, this[k].x - 0.5, this[k].y + 50 + this.indexesPos);
        }
    }
    // draw loopMarkers
    for (var name in this.loopMarks) {
        if (this.indexes.hasOwnProperty(name)) {
            // find the y position of the loopmark (0,1,2,...)
            var pos = 0;
            if (this.indexes[name].pos >= 0) {
                pos = this.indexes[name].pos;
            } else {
                var fixIndexPos = [];
                for (var name2 in this.indexes) {
                    if (this.indexes[name].value == this.indexes[name2].value && this.indexes[name].pos >= 0) {
                        fixIndexPos = fixIndexPos.concat([this.indexes[name2].pos]);
                    }
                }
                for (var name2 in this.indexes) {
                    if (this.indexes[name].value == this.indexes[name2].value && this.indexes[name].pos < 0 && name > name2) {
                        while (fixIndexPos.indexOf(pos) > -1) {
                            pos++;
                        }
                        fixIndexPos = fixIndexPos.concat([pos]);
                    }
                }
                while (fixIndexPos.indexOf(pos) > -1) {
                    pos++;
                }
            }
            // draw the loopmark rectangle
            var X;
            var Y;
            if (this.loopMarks[name].from >= 0 && this.loopMarks[name].from < this.length) {
                X = this[this.loopMarks[name].from].x;
                Y = this[this.loopMarks[name].from].y + 72 + this.indexesPos - 4 + 27 * pos;
            } else if (this.loopMarks[name].from == -1) {
                X = this[0].x - this[0].width - 2;
                Y = this[0].y + 72 + this.indexesPos - 4 + 27 * pos;
            } else {
                X = this[this.length - 1].x + this[this.length - 1].width + 2
                Y = this[this.length - 1].y + 72 + this.indexesPos - 4 + 27 * pos;
            }
            var Xto;
            if (this.loopMarks[name].to >= 0 && this.loopMarks[name].to < this.length) {
                Xto = this[this.loopMarks[name].to].x;
            } else if (this.loopMarks[name].to == -1) {
                Xto = this[0].x - this[0].width - 2;
            } else {
                Xto = this[this.length - 1].x + this[this.length - 1].width + 2
            }
            var width = Math.abs(X - Xto);
            var down = this.loopMarks[name].from > this.loopMarks[name].to;
            if (this.loopMarks[name].from == this.loopMarks[name].to) {
                down = this.loopMarks[name].backward;
            }
            if (down) {
                X = Xto;
            }            
            this.ctx.strokeStyle = this.loopMarkStrokeColor;
            this.ctx.fillStyle = this.loopMarkFillColor;
            this.ctx.beginPath();
            this.ctx.rect(X - 11, Y - 7.5, width + 22, 16);
            this.ctx.fill();
            this.ctx.stroke();
            // draw the loopmark arrows          
            this.ctx.fillStyle = this.loopMarkStrokeColor;
            this.ctx.font = "16px Comic Sans MS";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            var s = ">";
            if (down) {
                s = "<";
            }
            while (this.ctx.measureText(s + " >").width < width + 12) {
                if (!down) {
                    s = s + " >";
                } else {
                    s = s + " <";
                }
            }
            this.ctx.fillText(s, X + width / 2, Y);
        }
    }
    // go through all elements in array
    var maxIndexPos = -1;
    for (var i = -1; i <= this.length; i++) {
        if (i >= 0 && i < this.length) {
            // draw the element
            this[i].ctx = this.ctx;
            this[i].x = xpos;
            if (i < this.length - 1) {
                xpos = xpos + this[i].width / 2 + this[i + 1].width / 2 + 2;
            }
            this[i].y = this.y;
            this[i].height = maxHeight;
            this[i].render();
        }
        // render indexes
        var fixIndexPos = [];
        for (var name in this.indexes) {
            if (this.indexes[name].value == i && this.indexes[name].pos >= 0) {
                fixIndexPos = fixIndexPos.concat([this.indexes[name].pos]);
            }
        }
        var indexNames = [];
        for (var name in this.indexes) {
            indexNames = indexNames.concat([name]);
        }
        indexNames.sort();
        for (var j = 0; j < indexNames.length; j++) {
            if (this.indexes[indexNames[j]].value == i) {
                var indexPos = this.indexesPos;
                if (this.indexes[indexNames[j]].pos >= 0) {
                    indexPos = indexPos + 27 * this.indexes[indexNames[j]].pos;
                } else {
                    var k = 0;
                    while (fixIndexPos.indexOf(k) > -1) {
                        k++;
                    }
                    fixIndexPos = fixIndexPos.concat([k]);
                    indexPos = indexPos + 27 * k;
                }
                // draw the index circle
                this.ctx.strokeStyle = this.indexStrokeColor;
                this.ctx.fillStyle = this.indexFillColor;
                this.ctx.beginPath();
                if (i >= 0 && i < this.length) {
                    this.ctx.arc(this[i].x, this[i].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                } else if (i == -1) {
                    this.ctx.arc(this[0].x - this[0].width - 2, this[0].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                } else {
                    this.ctx.arc(this[this.length - 1].x + this[this.length - 1].width + 2, this[0].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                }
                if (indexPos > maxIndexPos) {
                    maxIndexPos = indexPos;
                }
                this.ctx.fill();
                this.ctx.stroke();
                // write index name into circle
                this.ctx.fillStyle = "#000";
                this.ctx.font = "bold 12px Courier New";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "alphabetic";
                if (i >= 0 && i < this.length) {
                    this.ctx.fillText(indexNames[j], this[i].x - 0.5, this[i].y + 72 + indexPos);
                } else if (i == -1) {
                    this.ctx.fillText(indexNames[j], this[0].x - this[0].width - 0.5 - 2, this[0].y + 72 + indexPos);
                } else {
                    this.ctx.fillText(indexNames[j], this[this.length - 1].x + this[this.length - 1].width - 0.5 + 2, this[0].y + 72 + indexPos);
                }
            }
        }
    }
    // markers (horizontal lines under indexes)
    var markerYPos;
    if (maxIndexPos == -1) {
        markerYPos = this[0].y + 55; 
    } else {
        markerYPos = this[0].y + 55 + maxIndexPos + 27;
    }
    // determine the maximum number of markers above/under each other
    var m = []
    for (var i = -1; i <= this.length; i++) {
        m[i] = 0;
    }
    for (var i = 0; i < this.markers.length; i++) {
        var max = 0;
        for (var j = this.markers[i].from; j <= this.markers[i].to; j++) {
            if (m[j] > max) {
                max = m[j];
            }
        }
        for (var j = this.markers[i].from; j <= this.markers[i].to; j++) {
            m[j] = max + 1;
        }
    }
    var maxMarkers = 0;
    for (var i = -1; i <= this.length; i++) {
        if (m[i] > maxMarkers) {
            maxMarkers = m[i];
        }
    }
    // draw the markers
    for (var i = -1; i <= this.length; i++) {
        m[i] = 0;
    }
    for (var i = 0; i < this.markers.length; i++) {
        var max = 0;
        for (var j = this.markers[i].from; j <= this.markers[i].to; j++) {
            if (m[j] > max) {
                max = m[j];
            }
        }
        for (var j = this.markers[i].from; j <= this.markers[i].to; j++) {
            m[j] = max + 1;
        }

        var markerX1Pos;
        if (this.markers[i].from >= 0) {
            markerX1Pos = this[this.markers[i].from].x - this[this.markers[i].from].width / 2;            
        } else {
            markerX1Pos = this[this.markers[0].from].x - this[this.markers[0].from].width * 1.5;
        }
        var markerX2Pos;
        if (this.markers[i].to < this.length) {
            markerX2Pos = this[this.markers[i].to].x + this[this.markers[i].to].width / 2;
        } else {
            markerX2Pos = this[this.markers[this.length-1].to].x + this[this.markers[this.length-1].to].width * 1.5;
        }
        this.ctx.strokeStyle = this.markers[i].color;
        this.ctx.beginPath();
        this.ctx.moveTo(markerX1Pos + 0.5, markerYPos + (maxMarkers - max) * 6 - 4);
        this.ctx.lineTo(markerX1Pos + 0.5, markerYPos + (maxMarkers - max) * 6);
        this.ctx.lineTo(markerX2Pos - 0.5, markerYPos + (maxMarkers - max) * 6);
        this.ctx.lineTo(markerX2Pos - 0.5, markerYPos + (maxMarkers - max) * 6 - 4);
        this.ctx.stroke();
    }
}

// render moving rectangles when copying
inalan.VisuArray.prototype.renderCopy = function () {
    for (var i = 0; i < this.length; i++) {
        this[i].renderCopy();
    }
}

// set minimum value for all elements in array
inalan.VisuArray.prototype.setMinValue = function (value) {
    for (var i = 0; i < this.length; i++) {
        this[i].minValue = value;
    }
}
// set maximum value for all elements in array
inalan.VisuArray.prototype.setMaxValue = function (value) {
    for (var i = 0; i < this.length; i++) {
        this[i].maxValue = value;
    }
}
// set height for all elements in array
inalan.VisuArray.prototype.setHeight = function (height) {
    for (var i = 0; i < this.length; i++) {
        this[i].setHeight(height);
    }
}