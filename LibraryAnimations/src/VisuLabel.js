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

inalan.VisuLabel = function (lines) {
    // create subclass VisuLabel from VisuData - set properties
    inalan.VisuData.call(this);
    // set new properties
    this.lines = lines;    
}

// create subclass VisuLabel from VisuData - set methods
inalan.VisuLabel.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuLabel.prototype.constructor = inalan.VisuLabel;

inalan.VisuLabel.prototype.render = function () {
    // draw the Visulabel    
    this.ctx.fillStyle = "#000";
    this.ctx.font = "14px Arial"
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    for (var i = 0; i < this.lines.length; i++) {
        this.ctx.fillText(this.lines[i], this.x, this.y + i * 18);
    }
}
