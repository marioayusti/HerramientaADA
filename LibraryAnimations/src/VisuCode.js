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

inalan.VisuCode = function (lines) {
    // create subclass VisuCode from VisuData - set properties
    inalan.VisuData.call(this);
    // set new properties
    this.lines = lines;
    this.selected = [];
    // background color of selected line
    this.selectionColor = "#DEE";
    this.recBackColor = "#EEE";
    // recursion (function call) - stored previous x, y, lines, and selected variables
    this.rec = [];
    // when the .functionReturn() was called, the following variable contains the selected line of function call
    this.recBackSelection = null; // back from recursion (function) - the selected line will be gray instead of lightblue
    // recursion (function call) animation active? 
    this.recAnim = []; // if the array is empty, then not, otherwise it contains the rectangle coordinates X, Y, WIDTH, HEIGHT, and the NEWLINES (new source code)
}

// create subclass VisuCode from VisuData - set methods
inalan.VisuCode.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuCode.prototype.constructor = inalan.VisuCode;

inalan.VisuCode.prototype.render = function () {
    // if inside a recursion, then draw rectangles
    if (this.rec.length > 0) {
        for (var i = 0; i < this.rec.length; i++) {
            // determine the longest line in source code
            this.ctx.font = "bold 16px Courier New"
            var maxWidth = 0;
            for (var j = 0; j < this.rec[i].lines.length; j++) {
                if (this.ctx.measureText(this.rec[i].lines[j]).width > maxWidth) {
                    maxWidth = this.ctx.measureText(this.rec[i].lines[j]).width;
                }
            }
            // draw rectangle if not the main program
            if (i > 0) {
                this.ctx.fillStyle = "#FFF";
                this.ctx.strokeStyle = "#000";
                this.ctx.beginPath();
                this.ctx.rect(this.rec[i].x, this.rec[i].y - 10, maxWidth + 40, this.rec[i].lines.length * 22 - 2 + 20);
                this.ctx.stroke();
                this.ctx.fill();
            }
            // write text (source code)
            this.ctx.fillStyle = "#EEE";
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "top";
            for (var j = 0; j < this.rec[i].lines.length; j++) {
                this.ctx.fillText(this.rec[i].lines[j], this.rec[i].x + 20, this.rec[i].y + 1 + j * 22);
            }
        }     
    }
    // determine the longest line in current source code
    this.ctx.font = "bold 16px Courier New"
    var maxWidth = 0;
    for (var i = 0; i < this.lines.length; i++) {
        if (this.ctx.measureText(this.lines[i]).width > maxWidth) {
            maxWidth = this.ctx.measureText(this.lines[i]).width;
        }
    }
    // if inside a recurcion (this is not the main program), then draw a rectangle
    if (this.rec.length > 0) {
        this.ctx.fillStyle = "#FFF";
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y - 10, maxWidth + 40, this.lines.length * 22 - 2 + 20);
        this.ctx.stroke();
        this.ctx.fill();
    }
    // draw selected rectangles
    if (this.recBackSelection == this.selected[0]) {
        this.ctx.fillStyle = this.recBackColor;
    } else {
        this.ctx.fillStyle = this.selectionColor;
        this.recBackSelection = null;
    }
    for (var i in this.selected) {
        this.ctx.fillRect(this.x, this.y + this.selected[i] * 22, maxWidth + 40, 20);
    }
    // draw the VisuCode - write the source code 
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    for (var i = 0; i < this.lines.length; i++) {
        this.ctx.fillText(this.lines[i], this.x + 20, this.y + 1 + i * 22);
    }
    // draw animation of recursion (if recAnim is not empty) - growing or decreasing rectangle
    if (this.recAnim.length > 0) {        
        this.ctx.fillStyle = "#FFF";
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        this.ctx.rect(this.recAnim[0], this.recAnim[1] - 10, this.recAnim[2], this.recAnim[3] - 2 + 20);
        this.ctx.stroke();
        this.ctx.fill();
        // write source code      
        var lineSpace = (this.recAnim[3] - 22) / (this.recAnim[4].length - 1);
        this.ctx.globalAlpha = lineSpace / 22;
        this.ctx.font = "bold 16px Courier New"
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        for (var i = 0; i < this.recAnim[4].length; i++) {
            this.ctx.fillText(this.recAnim[4][i], this.recAnim[0] + 20, this.recAnim[1] + 1 + i * lineSpace);
        }
        this.ctx.globalAlpha = 1;
    }
}

inalan.VisuCode.prototype.functionCall = function (newLines) {
    if (typeof (newLines) == 'undefined') {
        newLines = this.lines.slice();
    }
    var stage = this.ctx.canvas.parent;
    stage.animating++;
    var frames = stage.fps * stage.time / 1000; // = cca. 1 sec. animation    
    // determine the longest line in source code (lines)
    this.ctx.font = "bold 16px Courier New"
    var maxWidth = 0;
    for (var i = 0; i < this.lines.length; i++) {
        if (this.ctx.measureText(this.lines[i]).width > maxWidth) {
            maxWidth = this.ctx.measureText(this.lines[i]).width;
        }
    }
    // determine the longest line in new source code (newLines)
    this.ctx.font = "bold 16px Courier New"
    var newMaxWidth = 0;
    for (var i = 0; i < newLines.length; i++) {
        if (this.ctx.measureText(newLines[i]).width > newMaxWidth) {
            newMaxWidth = this.ctx.measureText(newLines[i]).width;
        }
    }
    // set starting rectangle
    this.recAnim = [this.x, this.y + this.selected[0] * 22, maxWidth + 40, 22, newLines];
    // set ending rectangle
    var endX = this.x + 3;
    var endY = this.y + 3;
    var endWidth = newMaxWidth + 40;
    var endHeight = newLines.length * 22;
    // calculate dX, dY, dWidth, dHeight
    var dX = (endX - this.recAnim[0]) / frames;
    var dY = (endY - this.recAnim[1]) / frames;
    var dWidth = (endWidth - this.recAnim[2]) / frames;
    var dHeight = (endHeight - this.recAnim[3]) / frames;
    // function to change the sizes
    var pauseFrames = stage.time / 100;
    frames += pauseFrames;
    var self = this;
    var recursionAnim = function () {
        frames--;
        if (frames >= pauseFrames) {
            self.recAnim[0] += dX;
            self.recAnim[1] += dY;
            self.recAnim[2] += dWidth;
            self.recAnim[3] += dHeight;
        } else if (frames > 0) {
            self.recAnim[0] = endX;
            self.recAnim[1] = endY;
            self.recAnim[2] = endWidth;
            self.recAnim[3] = endHeight;
        } else {
            clearInterval(intervalId);
            var n = self.rec.length;
            self.rec[n] = {
                "x": self.x,
                "y": self.y,
                "lines": self.lines.slice(),
                "selected": self.selected.slice()
            };
            self.x = endX;
            self.y = endY;
            self.lines = newLines;
            self.selected = [];
            self.recAnim = [];
            stage.animating--;
        }
    }
    // call the recursionAnim using the setInterval
    var intervalId = setInterval(recursionAnim, 1000 / stage.fps);
}

inalan.VisuCode.prototype.functionReturn = function () {
    var oldLines = this.lines.slice();    
    var n = this.rec.length - 1;
    this.x = this.rec[n].x;
    this.y = this.rec[n].y;
    this.lines = this.rec[n].lines.slice();
    this.selected = this.rec[n].selected.slice();
    this.rec = this.rec.slice(0, n);
    var stage = this.ctx.canvas.parent;
    stage.animating++;
    var frames = stage.fps * stage.time / 1000; // = cca. 1 sec. animation    
    // determine the longest line in source code (lines)
    this.ctx.font = "bold 16px Courier New"
    var maxWidth = 0;
    for (var i = 0; i < this.lines.length; i++) {
        if (this.ctx.measureText(this.lines[i]).width > maxWidth) {
            maxWidth = this.ctx.measureText(this.lines[i]).width;
        }
    }
    // determine the longest line in old source code (newLines)
    this.ctx.font = "bold 16px Courier New"
    var oldMaxWidth = 0;
    for (var i = 0; i < oldLines.length; i++) {
        if (this.ctx.measureText(oldLines[i]).width > oldMaxWidth) {
            oldMaxWidth = this.ctx.measureText(oldLines[i]).width;
        }
    }
    // set starting rectangle
    this.recAnim = [this.x + 3, this.y + 3, oldMaxWidth + 40, oldLines.length * 22, oldLines];
    // set ending rectangle
    var endX = this.x;
    var endY = this.y + this.selected[0] * 22;
    var endWidth = maxWidth + 40;
    var endHeight = 22;
    // calculate dX, dY, dWidth, dHeight
    var dX = (this.recAnim[0] - endX) / frames;
    var dY = (this.recAnim[1] - endY) / frames;
    var dWidth = (this.recAnim[2] - endWidth) / frames;
    var dHeight = (this.recAnim[3] - endHeight) / frames;
    // function to change the sizes
    var self = this;
    var recursionAnim = function () {
        frames--;
        if (frames > 0) {
            self.recAnim[0] -= dX;
            self.recAnim[1] -= dY;
            self.recAnim[2] -= dWidth;
            self.recAnim[3] -= dHeight;
        } else {
            clearInterval(intervalId);
            self.recAnim = [];
            self.recBackSelection = self.selected[0];
            stage.animating--;
        }
    }
    // call the recursionAnim using the setInterval
    var intervalId = setInterval(recursionAnim, 1000 / stage.fps);
}
