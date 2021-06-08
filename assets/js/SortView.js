function ComparisonSort(am, w, h, arr) {
	this.init(am, w, h, arr);
}
var thisGlobal;
var visibleVariables = {};

var BAR_FOREGROUND_COLOR = "#0000FF";
var BAR_BACKGROUND_COLOR = "#AAAAFF";
var INDEX_COLOR = "#0000FF";
var HIGHLIGHT_BAR_COLOR = "#FF0000";
var HIGHLIGHT_BAR_BACKGROUND_COLOR = "#FFAAAA";
var HIGHLIGHT_BAR_COLOR_SWAP = "#00ff08";
var HIGHLIGHT_BAR_BACKGROUND_COLOR_SWAP = "#93ff97";

ComparisonSort.prototype = new Algorithm();
ComparisonSort.prototype.constructor = ComparisonSort;
ComparisonSort.superclass = Algorithm.prototype;

ComparisonSort.prototype.init = function (am, w, h, arr) {
	var sc = ComparisonSort.superclass;
	var fn = sc.init;
	fn.call(this, am);
	this.nextIndex = 0;

	this.setArraySize();
	this.array_size = arr.length;
	this.arrayData = arr.slice(0);

	this.createVisualObjects();

	thisGlobal = this;
}

ComparisonSort.prototype.setArraySize = function () {
	this.array_width = 30;
	this.array_bar_width = 20;
	this.array_initial_x = 25;
	this.array_y_pos = 130;
	this.array_label_y_pos = 140;
}

ComparisonSort.prototype.showArray = function () {
	this.commands = new Array();
	for (var i = 0; i < this.array_size; i++) {
		// this.arrayData[i] = "[" + (i+1) + "]: " + this.arrayData[i];
		this.oldData[i] = this.arrayData[i];
		this.cmd("SetText", this.barLabels[i], "[" + (i + 1) + "]: " + this.arrayData[i]);
		this.cmd("SetHeight", this.barObjects[i], this.arrayData[i]);
	}

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();

}

ComparisonSort.prototype.createVisualObjects = function () {
	this.barObjects = new Array(this.array_size);
	this.oldBarObjects = new Array(this.array_size);
	this.oldbarLabels = new Array(this.array_size);

	this.barLabels = new Array(this.array_size);
	this.barPositionsX = new Array(this.array_size);
	this.oldData = new Array(this.array_size);
	this.obscureObject = new Array(this.array_size);


	var xPos = this.array_initial_x;
	var yPos = this.array_y_pos;
	var yLabelPos = this.array_label_y_pos;

	this.commands = new Array();
	for (var i = 0; i < this.array_size; i++) {
		xPos = xPos + this.array_width;
		this.barPositionsX[i] = xPos;
		this.cmd("CreateRectangle", this.nextIndex, "", this.array_bar_width, 200, xPos, yPos, "center", "bottom");
		this.cmd("SetForegroundColor", this.nextIndex, BAR_FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, BAR_BACKGROUND_COLOR);
		this.barObjects[i] = this.nextIndex;
		this.oldBarObjects[i] = this.barObjects[i];
		this.nextIndex += 1;
		this.cmd("CreateLabel", this.nextIndex, "99", xPos, yLabelPos);
		this.cmd("SetForegroundColor", this.nextIndex, INDEX_COLOR);

		this.barLabels[i] = this.nextIndex;
		this.oldbarLabels[i] = this.barLabels[i];
		++this.nextIndex;
	}
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.showArray();
	for (i = 0; i < this.array_size; i++) {
		this.obscureObject[i] = false;
	}
	this.lastCreatedIndex = this.nextIndex;
}

function swap(index1, index2) {
	thisGlobal.commands = new Array();
	thisGlobal.animationManager.clearHistory();

	tmp = thisGlobal.barObjects[index1];
	thisGlobal.barObjects[index1] = thisGlobal.barObjects[index2];
	thisGlobal.barObjects[index2] = tmp;

	//detectar índices
	var copiaIndex1 = "";
	var copiaIndex2 = "";
	var n1 = (thisGlobal.arrayData[index1] + "").indexOf('\n');
	var n2 = (thisGlobal.arrayData[index2] + "").indexOf('\n');
	if (n1 !== -1) {
		copiaIndex1 = (thisGlobal.arrayData[index1] + "").substr(n1 + 1, (thisGlobal.arrayData[index1] + "").length);
		clearIndexBar(index1);
	}
	if (n2 !== -1) {
		copiaIndex2 = (thisGlobal.arrayData[index2] + "").substr(n2 + 1, (thisGlobal.arrayData[index2] + "").length);
		clearIndexBar(index2);
	}

	var tmp = thisGlobal.arrayData[index1];
	thisGlobal.arrayData[index1] = thisGlobal.arrayData[index2];
	thisGlobal.arrayData[index2] = tmp;

	tmp = thisGlobal.barLabels[index1];
	thisGlobal.barLabels[index1] = thisGlobal.barLabels[index2];
	thisGlobal.barLabels[index2] = tmp;
	barColorChangeSwap(index1);
	barColorChangeSwap(index2);
	thisGlobal.cmd("Move", thisGlobal.barObjects[index1], thisGlobal.barPositionsX[index1], thisGlobal.array_y_pos);
	thisGlobal.cmd("Move", thisGlobal.barObjects[index2], thisGlobal.barPositionsX[index2], thisGlobal.array_y_pos);
	thisGlobal.cmd("Move", thisGlobal.barLabels[index1], thisGlobal.barPositionsX[index1], thisGlobal.array_label_y_pos);
	thisGlobal.cmd("Move", thisGlobal.barLabels[index2], thisGlobal.barPositionsX[index2], thisGlobal.array_label_y_pos);
	thisGlobal.cmd("SetText", thisGlobal.barLabels[index1], "[" + (index1 + 1) + "]: " + thisGlobal.arrayData[index1]);
	thisGlobal.cmd("SetText", thisGlobal.barLabels[index2], "[" + (index2 + 1) + "]: " + thisGlobal.arrayData[index2]);
	thisGlobal.cmd("Step");

	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
	setTimeout(() => {
		resetbarColorChange(index1);
		if (copiaIndex1 != "") {
			setIndexBar(index1, copiaIndex1);
		}
		if (copiaIndex2 != "") {
			setIndexBar(index2, copiaIndex2);
		}
		resetbarColorChange(index2);

	}, 500);
}

function changeSizeBar(i, newSize) {
	thisGlobal.commands = new Array();

	thisGlobal.arrayData[i] = newSize;
	thisGlobal.oldData[i] = thisGlobal.arrayData[i];
	thisGlobal.cmd("SetText", thisGlobal.barLabels[i], "[" + (i + 1) + "]: " + thisGlobal.arrayData[i]);
	thisGlobal.cmd("SetHeight", thisGlobal.barObjects[i], thisGlobal.arrayData[i]);

	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);

}

function setIndexBar(i, variable) {
	thisGlobal.commands = new Array();

	thisGlobal.arrayData[i] = thisGlobal.arrayData[i] + '\n' + variable;
	thisGlobal.cmd("SetText", thisGlobal.barLabels[i], "[" + (i + 1) + "]: " + thisGlobal.arrayData[i]);

	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function clearIndexBar(i) {
	thisGlobal.commands = new Array();

	removeIndex(i);
	thisGlobal.cmd("SetText", thisGlobal.barLabels[i], "[" + (i + 1) + "]: " + thisGlobal.arrayData[i]);

	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function removeIndex(i) {
	var index = (thisGlobal.arrayData[i] + "").indexOf('\n');
	if (index !== -1) {
		thisGlobal.arrayData[i] = (thisGlobal.arrayData[i] + "").substr(0, index);
	}
}

function barColorChange(barNumber) {
	thisGlobal.animationManager.clearHistory();
	thisGlobal.commands = new Array();
	thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[barNumber], HIGHLIGHT_BAR_COLOR);
	thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[barNumber], HIGHLIGHT_BAR_BACKGROUND_COLOR);
	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function barColorChangeSwap(barNumber) {
	thisGlobal.animationManager.clearHistory();
	thisGlobal.commands = new Array();
	thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[barNumber], HIGHLIGHT_BAR_COLOR_SWAP);
	thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[barNumber], HIGHLIGHT_BAR_BACKGROUND_COLOR_SWAP);
	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function resetbarColorChange(barNumber) {
	thisGlobal.animationManager.clearHistory();
	thisGlobal.commands = new Array();
	thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[barNumber], BAR_FOREGROUND_COLOR);
	thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[barNumber], BAR_BACKGROUND_COLOR);
	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function resetAllBarColorChange() {
	thisGlobal.animationManager.clearHistory();
	thisGlobal.commands = new Array();
	for (var i = 0; i < thisGlobal.array_size; i++) {
		thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[i], BAR_FOREGROUND_COLOR);
		thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[i], BAR_BACKGROUND_COLOR);
	}
	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function bubbleSortCallback() {
	thisGlobal.animationManager.clearHistory();
	thisGlobal.commands = new Array();

	for (var i = thisGlobal.array_size - 1; i > 0; i--) {
		for (var j = 0; j < i; j++) {
			thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[j], HIGHLIGHT_BAR_COLOR);
			thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[j], HIGHLIGHT_BAR_BACKGROUND_COLOR);

			thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[j + 1], HIGHLIGHT_BAR_COLOR);
			thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[j + 1], HIGHLIGHT_BAR_BACKGROUND_COLOR);
			thisGlobal.cmd("Step");
			if (thisGlobal.arrayData[j] > thisGlobal.arrayData[j + 1]) {
				swap(j, j + 1);
			}
			thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[j], BAR_FOREGROUND_COLOR);
			thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[j], BAR_BACKGROUND_COLOR);

			thisGlobal.cmd("SetForegroundColor", thisGlobal.barObjects[j + 1], BAR_FOREGROUND_COLOR);
			thisGlobal.cmd("SetBackgroundColor", thisGlobal.barObjects[j + 1], BAR_BACKGROUND_COLOR);
		}
	}
	thisGlobal.animationManager.StartNewAnimation(thisGlobal.commands);
}

function createCanvas(id, arr) {
	htmlCanvas = '<canvas id="' + id + '" width="250" height="180"></canvas>';
	$('#wrapContent').append(htmlCanvas);
	init(arr, id);
}

function addVisibleVariable(key, value) {
	visibleVariables[key] = value;
	$('#wrapVariables').append('<div id="divVariable' + key + '" class="p-2 bd-highlight"><span id="animationVariable' + key + '" style="display: block;">' + key + ':[' + value + ']</span></div>');
}

function removeVisibleVariable(key) {
	delete visibleVariables[key];
	document.getElementById("divVariable" + key).remove();
}

function animationChangeVariable(key, newValue) {
	$('#animationVariable' + key).removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
		$(this).removeClass();
	});
	setTimeout(() => {
		document.getElementById('animationVariable' + key).innerHTML = key + ':[' + newValue + ']';
	}, 1000);
}

function clearAllDivs() {
	document.getElementById('wrapVariables').innerHTML = "";
	document.getElementById('wrapContent').innerHTML = "";
}

var currentAlg;

function init(arr, id) {
	var mitad = 45 + ((27 * arr.length) / 2);
	document.getElementById(id).width = mitad * 2;
	var animManag = initCanvas(id, mitad);
	currentAlg = new ComparisonSort(animManag, canvas.width, canvas.height, arr);
}