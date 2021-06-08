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

inalan.VisuButton = function (text, width, onClickFnc) {
    // create subclass VisuButton from VisuData - set properties
    inalan.VisuData.call(this);
    // set new properties
    this.text = text;
    this.width = width;
    this.height = 26;
    this.enabled = true;
    this.pressed = false;
    this.onClickFnc = onClickFnc;
    this.color = "#FE6";
    this.font = "bold 14px Arial"
    // color constants
    this.defaultColor = "#FE6";
    this.overColor = "#FB3";
    this.disabledColor = "#EEE";
}

// create subclass VisuButton from VisuData - set methods
inalan.VisuButton.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuButton.prototype.constructor = inalan.VisuButton;

inalan.VisuButton.prototype.render = function () {
    if (this.width > 0) {
        // draw the VisuButton
        if (this.enabled) {
            this.ctx.fillStyle = this.color;
        } else {
            this.ctx.fillStyle = this.disabledColor;
        }
        this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        this.ctx.strokeStyle = "#000";
        this.ctx.strokeRect(this.x - this.width / 2 - 0.5, this.y - this.height / 2 - 0.5, this.width + 1, this.height + 1);
        if (this.enabled) {
            this.ctx.fillStyle = "#000";
        } else {
            this.ctx.fillStyle = "#666";
        }
        this.ctx.font = this.font;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "alphabetic";
        this.ctx.fillText(this.text, this.x, this.y + 4.5);
    }
}

inalan.VisuButton.prototype.isOver = function (x, y) {
    if (this.width>0 && Math.abs(x - this.x) <= this.width / 2 && Math.abs(y - this.y) <= this.height / 2) {
        return true;
    }
    return false
}