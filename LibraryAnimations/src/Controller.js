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

inalan.Controller = function () {    
    // set properties        
    this.x = 0;
    this.y = 0;
    this.fncIndex = [0]; // indexes in stepFncsArray, first item in main steps, second item in repeat steps, third in repet within repeat, etc.
    this.stepFncsArray = null; // array of functions for every step
    this.playingAnimation = false; // playing animation (Start/Stop button)
    this.waitingAnimation = false; // animation is waiting (animation is waiting im delay between steps when automatically playing)   
    this.nextStepAuto = -1; // automatically play the next step   
    this.singleStep = false; // single step or more steps together
    this.undo = []; // undo array to save steps (object properties and variables)
    var self = this;
    // variables for button labels
    this.resetLabel = "Reset";
    this.startLabel = "Play";
    this.stopLabel = "Stop";
    this.prevLabel = "◄◄";
    this.prevSingleLabel = "◄";
    this.nextSingleLabel = "►";
    this.nextLabel = "►►";
    this.speedLabel = "Speed of animation:";    
    // restore a step from undo array
    var restoreStepFromUndo = function (stepNumber) {
        var stage = self.ctx.canvas.parent;
        // copy attributes from var/visuItems to stage.variables/stage.visuItems
        var copyAttributes = function (obj1, obj2) {
            for (var i in obj1) {
                if (typeof (obj1[i]) === 'object') {
                    if (obj1[i] instanceof Array) {
                        obj2[i] = obj1[i];
                    } else {
                        if (!obj2.hasOwnProperty(i)) {
                            obj2[i] = {};
                        }
                        copyAttributes(obj1[i], obj2[i]);
                    }
                } else {
                    obj2[i] = obj1[i];
                }
            }
        }
        // delete unnecessary atributes (added in next step) from stage.variables/stage.visuItems
        var deleteAttributes = function (obj1, obj2) {
            for (var i in obj2) {
                if (typeof (obj2[i]) === 'object' && obj1.hasOwnProperty(i)) {
                    deleteAttributes(obj1[i], obj2[i]);
                } else {
                    if (!obj1.hasOwnProperty(i)) {
                        delete obj2[i];
                    }
                }
            }
        }
        var vars = JSON.parse(self.undo[stepNumber][1]);
        copyAttributes(vars, stage.vars);
        deleteAttributes(vars, stage.vars);
        var visuItems = JSON.parse(self.undo[stepNumber][2]);
        copyAttributes(visuItems, stage.visuItems);
        deleteAttributes(visuItems, stage.visuItems);
        // restore fncIndex
        self.fncIndex = JSON.parse(self.undo[stepNumber][3]);
        // restore arrow
        stage.showArrow = JSON.parse(self.undo[stepNumber][4]);
        stage.showBendedArrow = JSON.parse(self.undo[stepNumber][5]);
        stage.showDoubleArrow = JSON.parse(self.undo[stepNumber][6]);
        // restore nextStepAuto value
        self.nextStepAuto = self.undo[stepNumber][7]
    }
    // reset animation (restore the first step from undo array)
    var resetAnimationWhenPossible = false;
    var resetAnimation = function () { // reset animation
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation) {
            resetAnimationWhenPossible = false;
            self.playingAnimation = false;
            self.nextStepAuto = -1;
            self.startStop.text = self.startLabel;
            restoreStepFromUndo(0);
            self.undo = [];
            self.reset.enabled = false;
            self.startStop.enabled = true;
            self.prevSingleStep.enabled = false;
            self.nextSingleStep.enabled = true;
            self.prevStep.enabled = false;            
            self.nextStep.enabled = true;            
        } else if (stage.animating>0 || self.waitingAnimation) {
            resetAnimationWhenPossible = true;
        }
    }
    // step the animation backward one step
    var prevStepAnimation = function () { 
        var stage = self.ctx.canvas.parent;
        if (stage.animating == 0 && !self.waitingAnimation) {
            var i = self.undo.length - 1;
            if (!self.singleStep) {
                while (self.undo[i][7] > 0) {
                    i--;
                }
            }

            // restore step from undo array
            restoreStepFromUndo(i);
            // remove the last element(s) from undo array
            self.undo = self.undo.slice(0,i);
            if (self.undo.length == 0) {
                self.reset.enabled = false;
                self.prevSingleStep.enabled = false;
                self.prevStep.enabled = false;
            }
            self.startStop.enabled = true;
            self.nextSingleStep.enabled = true;
            self.nextStep.enabled = true;
        }
    }
    // functions to control the animation...     
    var startStopAnimation = function () { // starts/stops animation
        var stage = self.ctx.canvas.parent;
        self.singleStep = false;
        if (!self.playingAnimation) {
            // start animation
            self.playingAnimation = true;
            self.startStop.text = self.stopLabel;
            self.prevSingleStep.enabled = false;
            self.nextSingleStep.enabled = false;
            self.prevStep.enabled = false;
            self.nextStep.enabled = false;
            if (stage.animating==0) {
                nextStepAnimation();
            }
        } else {
            // stop animation
            self.playingAnimation = false;
            self.startStop.text = self.startLabel;
            if (self.undo.length > 0) {
                self.prevSingleStep.enabled = true;
                self.prevStep.enabled = true;
            }
            self.nextSingleStep.enabled = true;
            self.nextStep.enabled = true;
        }
    }
    var waitAnimationDone = function () { // this function runs when the waiting is done
        self.waitingAnimation = false;
        if (resetAnimationWhenPossible) {
            resetAnimation();
        } else if (self.playingAnimation || self.nextStepAuto>0) {
            nextStepAnimation();
        }
    }
    var nextStepAnimationDoneID; // the ID from setInterval for nextStepAnimationDone fuction
    var nextStepAnimationDone = function () { // this function checks every 1 ms if the animation is done
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation) {
            clearInterval(nextStepAnimationDoneID);
            if (resetAnimationWhenPossible) {
                resetAnimation();
            } else if (self.nextStepAuto==0) {
                nextStepAnimation();
            } else if (self.nextStepAuto > 0 && !self.singleStep) {
                self.waitingAnimation = true;
                setTimeout(waitAnimationDone, stage.time/1000*self.nextStepAuto);
            } else if (self.playingAnimation) {
                self.waitingAnimation = true;
                setTimeout(waitAnimationDone, stage.time);
            }            
        }
    }
    var nextStepAnimation = function () { // step the animation forward
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation && self.stepFncsArray != null) {            
            // saving objects on stage to undo array (stage.visuItems, stage.vars, self.fncIndex)
            if (self.nextStepAuto != 0) {
                // enable reset, and enable prevStep button if not autoplaying the animation
                self.reset.enabled = true;
                if (!self.playingAnimation) {
                    self.prevSingleStep.enabled = true;
                    self.prevStep.enabled = true;
                }
                // save object properties and vars into undo array
                var i = self.undo.length;
                self.undo[i] = new Array();
                self.undo[i][1] = JSON.stringify(stage.vars);
                self.undo[i][2] = JSON.stringify(stage.visuItems);
                self.undo[i][3] = JSON.stringify(self.fncIndex);
                self.undo[i][4] = JSON.stringify(stage.showArrow);
                self.undo[i][5] = JSON.stringify(stage.showBendedArrow);
                self.undo[i][6] = JSON.stringify(stage.showDoubleArrow);
                self.undo[i][7] = self.nextStepAuto; // -1 (if animation should stops), or >0 if waits for some millisecond
            }
            // step animation...
            stage.showArrow = [];
            stage.showBendedArrow = [];
            stage.showDoubleArrow = [];            
            stage.stopCopyingAndComparing();
            // determine stepsArray and stepsCheck (every element in these arrays are new repeats inside the previous repeats)
            var i = 0;
            var stepsArray = [self.stepFncsArray];
            var stepsCheck = [null];
            while (stepsArray[i][self.fncIndex[i]] instanceof Array) {
                stepsCheck[i+1] = stepsArray[i][self.fncIndex[i] + 1];
                stepsArray[i+1] = stepsArray[i][self.fncIndex[i]];                
                i++;
                if (i >= self.fncIndex.length) {
                    self.fncIndex[i] = 0;
                }
            }
            // run current step
            self.nextStepAuto = stepsArray[i][self.fncIndex[i]]();
            if (typeof (self.nextStepAuto) == 'undefined') {
                self.nextStepAuto = -1;
            }
            // increase fncIndex to next possible step
            var ok;
            do {
                ok = true;
                self.fncIndex[i]++;
                if (self.fncIndex[i] >= stepsArray[i].length) {
                    if (stepsCheck[i] != null) {
                        if (stepsCheck[i]()) {
                            // repeat some steps
                            self.fncIndex[i] = 0;
                        } else {
                            // no more repeat, step back to previous repeat
                            i--;
                            self.fncIndex[i]++; // to skip the check function
                            self.fncIndex = self.fncIndex.slice(0, i+1); // remove last item from array
                            ok = false;
                        }
                    } else {
                        // the whole animation ended, no more steps
                        self.nextStepAuto = -1;
                        self.playingAnimation = false;
                        if (self.undo.length > 0) {
                            self.prevSingleStep.enabled = true;
                            self.prevStep.enabled = true;
                        }
                        self.nextSingleStep.enabled = false;
                        self.nextStep.enabled = false;
                        self.startStop.enabled = false;
                        self.startStop.text = self.startLabel;
                    }
                }
            } while (!ok);
            nextStepAnimationDoneID = setInterval(nextStepAnimationDone, 1); // checks every 1ms if the animation is done
        }
    }
    var changeSpeedOfAnimation = function (position) { // when the speed of animation is changed (using the scrollbar)
        var stage = self.ctx.canvas.parent;
        stage.time = 2000 - position;
    }
    var prevStep = function () {
        self.singleStep = false;
        prevStepAnimation();
    }
    var nextStep = function () {
        self.singleStep = false;
        nextStepAnimation();
    }
    var prevSingleStep = function () {
        self.singleStep = true;
        prevStepAnimation();
    }
    var nextSingleStep = function () {
        self.singleStep = true;
        nextStepAnimation();
    }
    // buttons...
    this.reset = new inalan.VisuButton(this.resetLabel, 70, resetAnimation);    
    this.startStop = new inalan.VisuButton(this.startLabel, 70, startStopAnimation);
    this.prevStep = new inalan.VisuButton(this.prevLabel, 70, prevStep);
    this.prevSingleStep = new inalan.VisuButton(this.prevSingleLabel, 0, prevSingleStep);
    this.nextSingleStep = new inalan.VisuButton(this.nextSingleLabel, 0, nextSingleStep);
    this.nextStep = new inalan.VisuButton(this.nextLabel, 70, nextStep);
    this.reset.enabled = false;
    this.prevStep.enabled = false;
    this.prevSingleStep.enabled = false;
    // scrollbar...
    this.speed = new inalan.VisuScrollbar(this.speedLabel, 150, 200, 1800, 1000, changeSpeedOfAnimation);
}

// show all buttons (reset, startStop, step, speed),
// in default mode the startStop button is hidden
inalan.Controller.prototype.showAllButtons = function () {
    this.reset.width = 70;
    this.startStop.width = 70;
    this.prevStep.width = 70;
    this.prevSingleStep.width = 70;
    this.nextSingleStep.width = 70;
    this.nextStep.width = 70;
    this.speed.width = 150;    
}

// render the controller
inalan.Controller.prototype.render = function () {
    // draw a line above the buttons
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#000";
    this.ctx.moveTo(0, this.y - 40 + 0.5);
    this.ctx.lineTo(this.ctx.canvas.clientWidth, this.y - 40 + 0.5);
    this.ctx.stroke();
    // draw the buttons
    var spaceWidth = 0;
    if (this.reset.width > 0) {
        this.reset.ctx = this.ctx;
        this.reset.x = this.x + this.reset.width / 2;
        this.reset.y = this.y;
        this.reset.render();
        spaceWidth += 20;
    }
    if (this.startStop.width > 0) {
        this.startStop.ctx = this.ctx;
        this.startStop.x = this.x + this.reset.width + this.startStop.width / 2 + spaceWidth;
        this.startStop.y = this.y;
        this.startStop.render();
        spaceWidth += 20;
    }
    if (this.prevStep.width > 0) {
        this.prevStep.ctx = this.ctx;
        this.prevStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width / 2 + spaceWidth;
        this.prevStep.y = this.y;
        this.prevStep.render();
    }
    if (this.prevSingleStep.width > 0) {
        this.prevSingleStep.ctx = this.ctx;
        this.prevSingleStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.prevSingleStep.width / 2 + spaceWidth;
        this.prevSingleStep.y = this.y;
        this.prevSingleStep.render();
    }
    if (this.nextSingleStep.width > 0) {
        this.nextSingleStep.ctx = this.ctx;
        this.nextSingleStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.prevSingleStep.width + this.nextSingleStep.width / 2 + spaceWidth;
        this.nextSingleStep.y = this.y;
        this.nextSingleStep.render();
    }
    if (this.nextStep.width > 0) {
        this.nextStep.ctx = this.ctx;
        this.nextStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.prevSingleStep.width + this.nextSingleStep.width + this.nextStep.width / 2 + spaceWidth;
        this.nextStep.y = this.y;
        this.nextStep.render();
    }
    // draw the scrollbar
    if (this.speed.width > 0) {
        spaceWidth += 30;
        this.speed.ctx = this.ctx;
        this.speed.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.prevSingleStep.width + this.nextSingleStep.width + this.nextStep.width + this.speed.width / 2 + spaceWidth;
        this.speed.y = this.y;
        this.speed.render();
    }
}

// set up functions for steps, for checking (if true, repeat the steps), and for the last step
inalan.Controller.prototype.setSteps = function (stepsFncsArray) {
    this.stepFncsArray = stepsFncsArray;
}
