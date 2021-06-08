//---------------------------CONSTANTES---------------------------
const VELOCIDADNORMALMS = 1000;
const VELOCIDADUINORMALMS = 500;
const VELOCIDADUICAMBIOSMS = 250;
//----------------------------------------------------------------

var editor;
var editorSession;
var actLineSelected = [];
var actErrorMarker;
var Range = ace.require('ace/range').Range;
var breakPoints = {};
var visualizerIF;
var gameTreeIF;
var treeIF;
var isVisualicerActive = true;
var exampleChoosed;
var nameExampleChoosed;
var dataSpecial;
var editorGrammar;

$(document).ready(function () {
    //---------------------------------PRUEBAS-----------------------------------------------------------
    $("#headerBar").on("click", function () {
    });
    //---------------------------------------------------------------------------------------------------

    // //Abrir Documentación
    // $("#btnDoc").on("click", function () {
    //     openDocumentation();
    // });

    ace.require("ace/ext/language_tools");
    editorGrammar = ace.edit($("#editorGramatica")[0], {
        theme: "ace/theme/chrome",
        mode: "ace/mode/pseudo",
        enableBasicAutocompletion: true,
        autoScrollEditorIntoView: true,
        maxLines: 342,
        minLines: 342,
        readOnly: true
    });

    $.get('../assets/gramatica.txt', (grammar) => {
        editorGrammar.setValue(grammar, 1);
    }, 'text');

    //Creación del editor de código
    ace.require("ace/ext/language_tools");
    editor = ace.edit($("#editor")[0], {
        theme: "ace/theme/chrome",
        mode: "ace/mode/pseudo",
        enableBasicAutocompletion: true,
        autoScrollEditorIntoView: true,
        maxLines: 30,
        minLines: 30
    });

    //Evita seleccionar todo el código al dar click
    editor.on("guttermousedown", function (e) {
        e.stop();
    }, true);

    //Permite agregar breakpoints
    editor.on("gutterdblclick", function (e) {
        e.stop();
        if (!editor.getReadOnly()) {
            var line = parseInt(e.getDocumentPosition().row);
            if (breakPoints[line] == undefined) {
                createBreakPoint(line);
            } else {
                deleteBreakPoint(line);
            }
        } else {
            alertify.warning("No se pueden modificar los puntos de ruptura en ejecución.");
        }
    }, true);

    editor.on("change", function () {
        analyzeProgram();
    });

    editorSession = editor.getSession();

    //Cambio de tema del editor
    $('#estiloEditor a').on('click', function (evt) {
        evt.preventDefault();
        if (!$(this).hasClass("active")) {
            $('#estiloEditor a.active').removeClass("active");
            $(this).addClass("active");
            editor.setTheme("ace/theme/" + $(this).attr("data-tema"));
        }
    });

    //Inicializar Visualizer y Tree
    visualizerIF = document.getElementById("iframeVisualizer").contentWindow;
    gameTreeIF = document.getElementById("iframeGameTree").contentWindow;
    treeIF = document.getElementById("iframeTree").contentWindow;

    //escoger un algoritmo para cargarlo
    $('#examplesChooser a').on('click', function (evt) {
        evt.preventDefault();
        $.get('../assets/algorithms/' + $(this).attr("data-fname"), (pseudo) => {
            editor.setValue(pseudo, 1);
        }, 'text');
        exampleChoosed = $(this).attr("data-nAlgorithm");
        nameExampleChoosed = $(this).text();
        editor.setReadOnly(true);
        dataSpecial = $(this).attr("data-special");
        if (dataSpecial != undefined) {
            var element = document.getElementById("txtExampleDropdown");
            var element2 = document.getElementById("btnEditExampleTxt");
            convertToKatex("O(n^n)", element);
            convertToKatex("O(n^n)", element2);
            nameExampleChoosed = "O(n^n)";
        } else {
            $("#txtExampleDropdown").html(nameExampleChoosed);
            $("#btnEditExampleTxt").html(nameExampleChoosed);
        }
        $("#btnEditExample").fadeIn(VELOCIDADUINORMALMS);
    });

    $("#btnEditExample").on("click", function () {
        exampleChoosed = undefined;
        editor.setReadOnly(false);
        $(this).fadeOut(VELOCIDADUINORMALMS);
    });

    document.getElementById("checkVisualizer").checked = true;
    $("#checkVisualizer").on("change", function () {
        isVisualicerActive = this.checked;
        let tabVisualizer = document.getElementById("btnShowVisualizer");
        tabVisualizer.checked = this.checked;
        $(tabVisualizer).change();
        if (this.checked) {
            tabVisualizer.parentElement.parentElement.style.display = 'block';
        } else {
            tabVisualizer.parentElement.parentElement.style.display = 'none';
        }
    });

    $("#btnRun").on("click", function () {
        if (program !== undefined) {
            if (program.SUBPROGRAMS.main === undefined) {
                if (!alertify.selectMainSubprogram) {
                    alertify.dialog('selectMainSubprogram', function factory() {
                        return {
                            main: function (message) {
                                this.message = message;
                            },
                            setup: function () {
                                return {};
                            },
                            prepare: function () {
                                this.setContent(this.message);
                                this.setHeader('<h4 class="text-center">¡Seleccione la subrutina inicial (main)!</h4>');
                            }
                        };
                    });
                }
                alertify.selectMainSubprogram('<div class="btn-group-vertical w-100">' +
                    Object.keys(program.SUBPROGRAMS).reduce(function (VarList, nameAct) {
                        return VarList + '<button type="button" class="btn btn-secondary  w-100 mb-1" onclick="startProgram(' + "'" + nameAct + "'" + ')">' + nameAct + '</button>';
                    }, "") +
                    '</div>');
            } else {
                startProgram("main");
            }
        } else {
            alertify.error('El programa no se puede ejecutar.');
        }
    });

    $("#btnGame").on("click", function () {
        if (program !== undefined) {
            if (program.SUBPROGRAMS.main === undefined) {
                if (!alertify.selectAnalyzedSubprogram) {
                    alertify.dialog('selectAnalyzedSubprogram', function factory() {
                        return {
                            main: function (message) {
                                this.message = message;
                            },
                            setup: function () {
                                return {};
                            },
                            prepare: function () {
                                this.setContent(this.message);
                                this.setHeader('<h4 class="text-center">¡Seleccione la subrutina inicial (main)!</h4>');
                            }
                        };
                    });
                }
                alertify.selectAnalyzedSubprogram('<div class="btn-group-vertical w-100">' +
                    Object.keys(program.SUBPROGRAMS).reduce(function (VarList, nameAct) {
                        return VarList + '<button type="button" class="btn btn-secondary  w-100 mb-1" onclick="startAnalyzing(' + "'" + nameAct + "'" + ')">' + nameAct + '</button>';
                    }, "") +
                    '</div>');
            } else {
                startAnalyzing("main");
            }
        } else {
            alertify.error('El programa no se puede ejecutar para modo juego.');
        }
    });

    $('#spdSelector a').on('click', function (evt) {
        evt.preventDefault();
        if (!$(this).hasClass("active")) {
            $('#spdSelector a.active').removeClass("active");
            $(this).addClass("active");
            var spd = parseFloat($(this).attr("data-vel"));
            if (spd == 1) {
                $('#spdSelector button').text("normal");
            } else {
                $('#spdSelector button').text("x" + spd);
            }
            changeSpeed(spd);
        }
    });

    $("#btnStop").on("click", function () {
        stopExecution();
    });

    $("#btnPlay").on("click", function () {
        if (autoExecuteID == undefined) {
            $("#spdSelector").fadeIn(VELOCIDADUINORMALMS);
            startAutoExecute();
        } else {
            $("#spdSelector").fadeOut(VELOCIDADUINORMALMS);
            pauseAutoExecute();
        }
        $("#btnBackStep, #btnNextStep").toggleClass("disabled");
        $("i", this).toggleClass("fa-play fa-pause");
    });

    $("#btnBackStep").on("click", function () {
        if (!$(this).hasClass('disabled')) {
            alertify.success("Disponible, pronto");
        }
    });

    $("#btnNextStep").on("click", function () {
        if (!$(this).hasClass('disabled')) {
            executeStatement();
        }
    });

    $('#btnShowTree, #btnShowVars, #btnShowVisualizer, #btnBreakpoints').on('change', function () {
        if (this.checked) {
            $(this).parent().parent().removeClass("disabled");
            switch ($(this).data("tab")) {
                case 1:
                    $("#containerVisualizer").slideDown(VELOCIDADUICAMBIOSMS);
                    break;
                case 2:
                    $("#containerTree").slideDown(VELOCIDADUICAMBIOSMS);
                    break;
                case 3:
                    $("#containerVariables").slideDown(VELOCIDADUICAMBIOSMS);
                    break;
                case 4:
                    $("#containerBreakPoints").slideDown(VELOCIDADUICAMBIOSMS);
                    break;
            }
        } else {
            $(this).parent().parent().addClass("disabled");
            switch ($(this).data("tab")) {
                case 1:
                    $("#containerVisualizer").slideUp(VELOCIDADUICAMBIOSMS);
                    break;
                case 2:
                    $("#containerTree").slideUp(VELOCIDADUICAMBIOSMS);
                    break;
                case 3:
                    $("#containerVariables").slideUp(VELOCIDADUICAMBIOSMS);
                    break;
                case 4:
                    $("#containerBreakPoints").slideUp(VELOCIDADUICAMBIOSMS);
                    break;
            }
        }
    });
    document.getElementById("btnShowVars").checked = false;
    document.getElementById("btnBreakpoints").checked = false;
    document.getElementById("btnShowTree").checked = true;
    document.getElementById("btnShowVisualizer").checked = true;

    $("#fileURLInput").on("change", function () {
        cargarArchivo();
    });

    $("#btnDownloadFile").on("click", function () {
        getNameFile();
    });

    $("#btnUploadFile").on("click", function () {
        $("#fileURLInput").click();
    });

    $("#btnStartGame").on("click", function () {
        askForRecursive();
    });

    $("#btnStopGame").on("click", function () {
        alertify.confirm('¿Desea salir del juego?', 'Tendrás que volver a empezar desde cero.',
            function () {
                hideGamingUI();
            }
            , function () {

            }).set('labels', { ok: 'Si', cancel: 'No' });
    });

    $("#btnCheckTrees").on("click", function () {
        compareTrees();
    });

    dragElement(document.getElementById("containerGameInfo"));

    $("#btnNextLineGame").on("click", function () {
        nextLineGame();
    });

    $("#btnCheckComplexity").on("click", function () {
        validateComplexity();
    });
});

function convertToKatex(text, element) {
    katex.render(text, element, {
        throwOnError: false
    });
}

function showRunningUI() {
    $("#hubExecutionControllerContainer button").prop('disabled', false);
    $("#containerSideBtns").fadeIn(VELOCIDADUINORMALMS);
    $("#viewerCointainer").fadeIn(VELOCIDADUINORMALMS);
    $("#configBar").slideUp(VELOCIDADUINORMALMS);
    $("#hubExecutionControllerContainer").fadeIn(VELOCIDADUINORMALMS);
    editor.setReadOnly(true);
    editor.setOption("maxLines", 33);
    editor.resize();
}

function hideRunningUI() {
    $("#hubExecutionControllerContainer button").prop('disabled', true);
    $("#hubExecutionControllerContainer").fadeOut(VELOCIDADUINORMALMS);
    $("#containerSideBtns").fadeOut(VELOCIDADUINORMALMS);
    $("#viewerCointainer").fadeOut(VELOCIDADUINORMALMS);
    $("#configBar").slideDown(VELOCIDADUINORMALMS);
    unSelectActLine();
    if (exampleChoosed == undefined) {
        editor.setReadOnly(false);
    }
    editor.setOption("maxLines", 30);
    editor.resize();
}

function showGamingUI() {
    skipAll = true;
    deleteAllBreakPoints();
    loadGameUI();
    $("#gameCointainer").fadeIn(VELOCIDADUINORMALMS);
    $("#configBar").slideUp(VELOCIDADUINORMALMS);
    editor.setReadOnly(true);
    editor.setOption("maxLines", 33);
    editor.resize();
}

function hideGamingUI() {
    unSelectActLine();
    skipAll = false;
    $("#gameCointainer").fadeOut(VELOCIDADUINORMALMS);
    $("#configBar").slideDown(VELOCIDADUINORMALMS);
    unSelectActLine();
    if (exampleChoosed == undefined) {
        editor.setReadOnly(false);
    }
    editor.setOption("maxLines", 30);
    editor.resize();
}

function disableExecutionUI() {
    tryPauseAutoExecute();
    $("#executionBtns button").prop('disabled', true);
}

function pauseUI() {
    $("#spdSelector").fadeOut(VELOCIDADUINORMALMS);
    $("#btnBackStep, #btnNextStep").toggleClass("disabled");
    $("#btnPlay i").toggleClass("fa-play fa-pause");
}

function selectActLine(line) {
    unSelectActLine();
    editorSession.addGutterDecoration(line, "ace_selected_gutter");
    actLineSelected[0] = editorSession.addMarker(
        new Range(line, 0, line, 1), "ace_selected_line", "fullLine"
    );
    editor.scrollToLine(line, true, true, undefined);
    actLineSelected[1] = line;
}

function unSelectActLine() {
    editorSession.removeGutterDecoration(actLineSelected[1], "ace_selected_gutter");
    deleteMarker(actLineSelected[0]);
}

function createBreakPoint(line) {
    editorSession.addGutterDecoration(line, "fas fa-star ace_breakpoint_gutter");
    var marker = editorSession.addMarker(
        new Range(line, 0, line, 1), "ace_breakpoint_line", "fullLine"
    );
    breakPoints[line] = marker;
}

function deleteAllBreakPoints() {
    if (sizeObj(breakPoints) > 0) {
        for (let [line] of Object.entries(breakPoints)) {
            deleteBreakPoint(line);
        }
        alertify.warning("Se quitaron todos los breakpoints");
    }
}

function deleteBreakPoint(line) {
    editorSession.removeGutterDecoration(line, "fas fa-star ace_breakpoint_gutter");
    deleteMarker(breakPoints[line]);
    delete breakPoints[line];
}

function deleteMarker(id) {
    editorSession.removeMarker(id);
}

function getUISpeed() {
    return (VELOCIDADNORMALMS / parseFloat($('#spdSelector a.active').attr("data-vel")));
}

function showSelectionVarsVisualizer(VarsToShow) {
    if (!subprogram.skipExecution && !skipAll) {
        resetVisualizer();
        if (VarsToShow != null) {
            for (let index = 0; index < VarsToShow.length; index++) {
                const element = VarsToShow[index];
                subprogram.VarsVisualized[index] = element;
            }
            showVariablesVisualizer();
        } else if (isVisualicerActive) {
            var paused = tryPauseAutoExecute();
            if (!alertify.selectVarsVisualizer) {
                alertify.dialog('selectVarsVisualizer', function factory() {
                    return {
                        main: function (message) {
                            this.message = message;
                        },
                        setup: function () {
                            return {
                                buttons: [{
                                    text: "¡Iniciar Ejecución!",
                                    className: alertify.defaults.theme.ok
                                }],
                                focus: {
                                    element: 0
                                }
                            };
                        },
                        hooks: {
                            onclose: function () {
                                showVariablesVisualizer();
                                if (paused) {
                                    $("#btnPlay").click();
                                }
                            }
                        },
                        prepare: function () {
                            this.setContent(this.message);
                            this.setHeader('<h4 class="text-center">¡Seleccione las variables a mostrar para: ' + subprogram.name + '!</h4>');
                        }
                    };
                });
            }
            alertify.selectVarsVisualizer('<div class="btn-group-vertical w-100">' +
                Object.keys(subprogram.localVariables).reduce(function (VarList, nameAct) {
                    return VarList + '<button type="button" class="btn btn-secondary  w-100 mb-1" onclick="selectVariableToShow(' + "'" + nameAct + "', this" + ')">' + nameAct + '</button>';
                }, "") +
                '</div>');
        }
    }
}

// ---------- Funciones Visualizer ----------

function selectVariableToShow(id, button) {
    var index = subprogram.VarsVisualized.indexOf(id);
    if (index == -1) {
        subprogram.VarsVisualized.push(id);
    } else {
        subprogram.VarsVisualized.splice(index, 1);
    }
    $(button).toggleClass("btn-secondary btn-primary");
}

function showVariablesVisualizer() {
    for (let i = 0; i < subprogram.VarsVisualized.length; i++) {
        const varId = subprogram.VarsVisualized[i];
        const varDataType = getVariableDataType(varId);
        if (varDataType.includes("[][]")) {
            visualizerIF.drawMatriz(getVariableValue(varId), varId);
        } else if (varDataType.includes("[]")) {
            if (varDataType.slice(0, -2) == "int") {
                visualizerIF.createCanvas(varId, getVariableValue(varId));
            } else {
                visualizerIF.drawMatriz([getVariableValue(varId)], varId);
            }
        } else if (varDataType.includes("pila")) {
            visualizerIF.createCanvasStack(varId);
        } else if (varDataType.includes("cola")) {
            visualizerIF.createCanvasQueue(varId);
        } else if (varDataType.includes("lista")) {
            alertify.success("La visualización de listas estará disponible proximamente");
        } else {
            visualizerIF.addVisibleVariable(varId, getVariableValue(varId));
        }
    }
}

function resetVisualizer() {
    visualizerIF.clearAllDivs();
}

function SelectCanvas(id) {
    visualizerIF.init(getVariableValue(id), id);
}

function selectIndexArray(index) {
    visualizerIF.barColorChange(index);
}

function unselectIndexArray(index) {
    visualizerIF.resetbarColorChange(index);
}

function removeViewContent(id) {
    visualizerIF.removeViewContent(id);
}

function checkIsOnVisualizer(id) {
    return subprogram.VarsVisualized.indexOf(id) > -1;
}

function visualizeVariableChange(id, value) {
    if (checkIsOnVisualizer(id)) {
        visualizerIF.animationChangeVariable(id, value);
    }
}

function visualizeswapArrayCanvas(left, right) {
    if (checkIsOnVisualizer(left.id) && left.type == "ArrayAccess" && right.type == "ArrayAccess" && left.id == right.id && visualizerIF.isCanvas(left.id)) {
        SelectCanvas(left.id);
        var i = getArrayIndex(left.index)[0] - 1;
        var j = getArrayIndex(right.index)[0] - 1;
        visualizerIF.swap(i, j);
        return true;
    }
}

function visualizeArrayAccess(exp, index) {
    if (checkIsOnVisualizer(exp.id)) {
        index[0]--;
        if (index.length == 1) {
            if (visualizerIF.isCanvas(exp.id)) {
                if (exp.index[0].type == "Variable") {
                    SelectCanvas(exp.id);
                    selectIndexArray(index[0]);
                    visualizerIF.setIndexBar(index[0], exp.index[0].id);
                }
            } else {
                visualizerIF.unsealAllCell(exp.id);
                visualizerIF.drawCell(exp.id, 0, index[0]);
            }
        } else {
            index[1]--;
            visualizerIF.unsealAllCell(exp.id);
            visualizerIF.drawCell(exp.id, index[0], index[1]);
        }
    }
}

function visualizeArrayChangeValue(exp, value, vsChange) {
    if (vsChange == undefined && checkIsOnVisualizer(exp.id)) {
        let index = getArrayIndex(exp.index);
        index[0]--;
        if (index.length == 1) {
            if (visualizerIF.isCanvas(exp.id)) {
                SelectCanvas(exp.id);
                selectIndexArray(index[0]);
                visualizerIF.changeSizeBar(index[0], value);
                setTimeout(() => {
                    unselectIndexArray(index[0]);
                }, VELOCIDADUICAMBIOSMS);
            } else {
                visualizerIF.animationChangeVariable(exp.id, 0, index[0]);
                visualizerIF.changeValueCell(exp.id, 0, index[0], value);
            }
        } else {
            index[1]--;
            visualizerIF.animationChangeVariable(exp.id, index[0], index[1]);
            visualizerIF.changeValueCell(exp.id, index[0], index[1], value);
        }
    }
}

function pushStackVisualizer(varid, value) {
    if (checkIsOnVisualizer(varid)) {
        // SelectCanvas(varid);
        visualizerIF.pushStack(value);
    }
}

function popStackVisualizer(varid) {
    if (checkIsOnVisualizer(varid)) {
        // SelectCanvas(varid);
        visualizerIF.popStack();
    }
}

function enqueueQueueVisualizer(varid, value) {
    if (checkIsOnVisualizer(varid)) {
        // SelectCanvas(varid);
        visualizerIF.enqueueCall(value);
    }
}

function dequeueQueueVisualizer(varid) {
    if (checkIsOnVisualizer(varid)) {
        // SelectCanvas(varid);
        visualizerIF.dequeueCall();
    }
}

// --------------------------------------------------

// function openDocumentation() {
//     window.open("../views/documentation.html", '_blank');
// }

function updatePointsUI() {
    var porcentaje = (points / maxPointsLevel) * 100;
    $("#pointsBar").html(points);
    $("#pointsBar").width(porcentaje + "%");
}

function resetAttemptsUI() {
    $("#attemptsContainer").html("");
    let attempsUI = '<span><i class="fas fa-life-ring"></i></span>&nbsp;' +
        '<span><i class="fas fa-life-ring"></i></span>&nbsp;' +
        '<span><i class="fas fa-life-ring"></i></span>&nbsp;' +
        '<span><i class="fas fa-life-ring"></i></span>&nbsp;' +
        '<span><i class="fas fa-life-ring"></i></span>';
    $("#attemptsContainer").append(attempsUI);
}

function removeAttemptsUI() {
    $("#attemptsContainer span:last-child").remove();
}

function loadGameUI() {
    $("#containerGameMenu").fadeIn();
    $("#containerGameComplexity").fadeOut();
    $("#containerGameIterative").fadeOut();
    $("#containerGameTree").fadeOut();
}

function loadTreeCreation() {
    $("#containerGameMenu").fadeOut();
    $("#containerGameTree").fadeIn(VELOCIDADUINORMALMS);
}

function loadIterativeGame() {
    $("#containerGameMenu").fadeOut();
    $("#containerGameIterative").fadeIn(VELOCIDADUINORMALMS);
    startIterativeGame();
}

function loadComplexityGame() {
    $("#containerGameTree").fadeOut();
    $("#containerGameIterative").fadeOut();
    $("#containerGameComplexity").fadeIn(VELOCIDADUINORMALMS);
    startComplexityGame();
}

function getLineGame() {
    return $("#inputLineGame").val();
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

alertify.defaults = {
    autoReset: true,
    basic: false,
    closable: false,
    closableByDimmer: false,
    frameless: false,
    maintainFocus: true,
    maximizable: false,
    modal: true,
    movable: true,
    moveBounded: false,
    overflow: true,
    padding: false,
    pinnable: true,
    pinned: true,
    preventBodyShift: false,
    resizable: false,
    startMaximized: false,
    transition: 'pulse',
    notifier: {
        delay: 5,
        position: 'bottom-left',
        closeButton: false
    },
    glossary: {
        title: 'AlertifyJS',
        ok: 'OK',
        cancel: 'Cancelar'
    },
    theme: {
        input: 'ajs-input',
        ok: 'ajs-ok', //btn btn-primario
        cancel: 'ajs-cancel' //btn btn-secundario
    }
};