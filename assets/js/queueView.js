var thisGlobal;

var LINKED_LIST_START_X = 100;
var LINKED_LIST_START_Y = 200;
var LINKED_LIST_ELEM_WIDTH = 70;
var LINKED_LIST_ELEM_HEIGHT = 30;


var LINKED_LIST_INSERT_X = 250;
var LINKED_LIST_INSERT_Y = 50;

var LINKED_LIST_ELEMS_PER_LINE = 8;
var LINKED_LIST_ELEM_SPACING = 100;
var LINKED_LIST_LINE_SPACING = 100;

var TOP_POS_X = 180;
var TOP_POS_Y = 100;
var TOP_LABEL_X = 130;
var TOP_LABEL_Y =  100;

var TOP_ELEM_WIDTH = 30;
var TOP_ELEM_HEIGHT = 30;

// var TAIL_POS_X = 180;
// var TAIL_LABEL_X = 130;

var PUSH_LABEL_X = 50;
var PUSH_LABEL_Y = 30;
var PUSH_ELEMENT_X = 120;
var PUSH_ELEMENT_Y = 30;

var SIZE = 32;

function QueueLL(am, w, h)
{
	this.init(am, w, h);
	
}

QueueLL.prototype = new Algorithm();
QueueLL.prototype.constructor = QueueLL;
QueueLL.superclass = Algorithm.prototype;


QueueLL.prototype.init = function(am, w, h)
{
	QueueLL.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.commands = [];
	// this.tail_pos_y = h - LINKED_LIST_ELEM_HEIGHT;
	// this.tail_label_y = this.tail_pos_y;
	this.setup();
    this.initialIndex = this.nextIndex;
    thisGlobal = this;
}

QueueLL.prototype.setup = function() {
	this.linkedListElemID = new Array(SIZE);
	for (var i = 0; i < SIZE; i++){
		this.linkedListElemID[i]= this.nextIndex++;
	}
	this.headID = this.nextIndex++;
	this.headLabelID = this.nextIndex++;

	// this.tailID = this.nextIndex++;
	// this.tailLabelID = this.nextIndex++;
	
	this.arrayData = new Array(SIZE);
	this.top = 0;
	this.leftoverLabelID = this.nextIndex++;
	
	this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X, TOP_LABEL_Y);
	this.cmd("CreateRectangle", this.headID, "", TOP_ELEM_WIDTH, TOP_ELEM_HEIGHT, TOP_POS_X, TOP_POS_Y);
	this.cmd("SetNull", this.headID, 1);
	
	
	// this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_LABEL_X, this.tail_label_y);
	// this.cmd("CreateRectangle", this.tailID, "", TOP_ELEM_WIDTH, TOP_ELEM_HEIGHT, TAIL_POS_X, this.tail_pos_y);
	// this.cmd("SetNull", this.tailID, 1);
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", 5, PUSH_LABEL_Y,0);
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();		
}

QueueLL.prototype.resetLinkedListPositions = function() {
	for (var i = this.top - 1; i >= 0; i--){
		var nextX = (this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
		var nextY = Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
		this.cmd("Move", this.linkedListElemID[i], nextX, nextY);				
	}
}

function createCanvasQueue(id) {
	htmlCanvas = '<canvas id="' + id + '" width="1000" height="250"></canvas>';
	$('#wrapContent').append(htmlCanvas);
	initQueue(id);
}

function removeQueue(id){
    document.getElementById(id).remove();
}
		
function enqueueCall(value) {
	if (thisGlobal.top < SIZE && value != "") {
		thisGlobal.implementAction(thisGlobal.enqueue.bind(thisGlobal), value);
	}
}		
		
function dequeueCall() {
	if (thisGlobal.top > 0) {
		thisGlobal.implementAction(thisGlobal.dequeue.bind(thisGlobal), "");
	}
}		

function clearQueue() {
	thisGlobal.implementAction(thisGlobal.clearAll.bind(thisGlobal), "");
}

QueueLL.prototype.enqueue = function(elemToPush) {
	this.commands = new Array();	
	this.arrayData[this.top] = elemToPush;	
    this.cmd("SetText", this.leftoverLabelID, "");
    	
	for (var i  = this.top; i > 0; i--) {
		this.arrayData[i] = this.arrayData[i-1];
		this.linkedListElemID[i] =this.linkedListElemID[i-1];
	}
	this.arrayData[0] = elemToPush;
	this.linkedListElemID[0] = this.nextIndex++;
	
	var labPushID = this.nextIndex++;
	var labPushValID = this.nextIndex++;
	this.cmd("CreateLinkedList",this.linkedListElemID[0], "" ,LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT, 
		LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y, 0.25, 0, 1, 1);
	
	this.cmd("SetNull", this.linkedListElemID[0], 1);
	this.cmd("CreateLabel", labPushID, "Enqueuing Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPushValID,elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
	
	this.cmd("Step");
	
	this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
	
	this.cmd("Step");
	this.cmd("SetText", this.linkedListElemID[0], elemToPush);
	this.cmd("Delete", labPushValID);
	
	if (this.top == 0) {
		this.cmd("SetNull", this.headID, 0);
		// this.cmd("SetNull", this.tailID, 0);
		this.cmd("connect", this.headID, this.linkedListElemID[this.top]);
		// this.cmd("connect", this.tailID, this.linkedListElemID[this.top]);
	} else {
		this.cmd("SetNull", this.linkedListElemID[1], 0);
		this.cmd("Connect",  this.linkedListElemID[1], this.linkedListElemID[0]);
		this.cmd("Step");
		// this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
	}
	// this.cmd("Connect", this.tailID, this.linkedListElemID[0]);
	
	this.cmd("Step");
	this.top = this.top + 1;
	this.resetLinkedListPositions();
	this.cmd("Delete", labPushID);
	this.cmd("Step");
	
	return this.commands;
}

QueueLL.prototype.dequeue = function(ignored) {
	this.commands = new Array();
	var labPopID = this.nextIndex++;
	var labPopValID = this.nextIndex++;

	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLabel", labPopID, "Dequeued Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPopValID,this.arrayData[this.top - 1], LINKED_LIST_START_X, LINKED_LIST_START_Y);
	
	this.cmd("Move", labPopValID,  PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
	this.cmd("Step");
	this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
	
	if (this.top == 1){
		this.cmd("SetNull", this.headID, 1);
		// this.cmd("SetNull", this.tailID, 1);
		// this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top-1]);
	} else {
		this.cmd("Connect", this.headID, this.linkedListElemID[this.top-2]);
	}
	this.cmd("Step");
	this.cmd("Delete", this.linkedListElemID[this.top - 1]);
	this.top = this.top - 1;
	this.resetLinkedListPositions();
	
	this.cmd("Delete", labPopValID)
	this.cmd("Delete", labPopID);
	this.cmd("SetText", this.leftoverLabelID, "Dequeued Value: " + this.arrayData[this.top]);

	return this.commands;
}

QueueLL.prototype.clearAll = function() {
	this.commands = new Array();
	for (var i = 0; i < this.top; i++) {
		this.cmd("Delete", this.linkedListElemID[i]);
	}
	this.top = 0;
	this.cmd("SetNull", this.headID, 1);
	return this.commands;
	
}

var currentAlg;

function initQueue(id)
{
	var animManag = initCanvas(id,150);
	currentAlg = new QueueLL(animManag, canvas.width, canvas.height);
}
