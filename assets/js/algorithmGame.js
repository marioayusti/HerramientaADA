var recursiveCalls = [];
var points = 0;
var maxPointsLevel = 50;
var attempts = 5;
var mainNameGame;
var indexLineAct;
var lineActG;

var allOptionsForm = ['O(n^n)', 'O(n*log (n))', "O(n^2)", "O(1)", "O(n)", "O(n/2)"];
var answersForm = {
    1: { "best": "O(n)", "wrost": "O(n^2)" },
    2: { "best": "O(n)", "wrost": "O(n^2)" },
    3: { "best": "O(n^2)", "wrost": "O(n^2)" },
    4: { "best": "O(n * log(n))", "wrost": "O(1)" },
    5: { "best": "O(n * log(n))", "wrost": "O(n * log(n))" },
    6: { "best": "O(n * log(n))", "wrost": "O(n^2)" },
};
var bestSelectedUser;
var worstSelectedUser;

function startAnalyzing(mainName) {
    worstSelectedUser = undefined;
    bestSelectedUser = undefined;
    $("#txtOpcionsBest").html("Opciones");
    $("#txtOpcionsWorst").html("Opciones");
    document.getElementById("bestCaseOptionsItems").innerHTML = "";
    document.getElementById("worstCaseOptionsItems").innerHTML = "";
    var actSubprogram = program.SUBPROGRAMS[mainName];
    if (sizeObj(actSubprogram.params) > 0) {
        alertify.error('La subrutina inicial no debe tener parametros.');
    } else {
        for (var idVar in program.GLOBALS) {
            program.GLOBALS[idVar].value = evalExpression(program.GLOBALS[idVar].value);
        }
        if (alertify.selectAnalyzedSubprogram) {
            alertify.selectAnalyzedSubprogram().close();
        }
        showGamingUI();
        mainNameGame = mainName;
        lineOrder = [];
        lineCounting = {};
        recursiveCalls = [];
        points = 0;
        updatePointsUI();
        attempts = 5;
        resetAttemptsUI();
        treeIF.resetTree();
        callStack = [];
        subprogram.reset();
        subprogram.name = mainName;
        createLocalVariables(actSubprogram.localVars, actSubprogram.params);
        subprogram.addBlock(actSubprogram.body);
        // tryLoadComplexityGame();
        console.log(lineCounting);
        console.log(lineOrder);
    }
}

function askForRecursive() {
    alertify.confirm('Primera Pregunta', '¿El algoritmo es recursivo?',
        function () {
            if (recursiveCalls.length == 0) {
                alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i>');
                lostAttempts();
            } else {
                alertify.success('¡Bien!&nbsp;<i class="far fa-smile-beam"></i><br>El algoritmo tiene llamados recursivos en: ' + getRecursiveCalls());
                addPoints(sizeObj(program.SUBPROGRAMS));
                loadTreeCreation();
            }
        }
        , function () {
            if (recursiveCalls.length == 0) {
                alertify.success('¡Bien!&nbsp;<i class="far fa-smile-beam"></i><br>¡El algoritmo no tiene llamados recursivos!');
                addPoints(sizeObj(program.SUBPROGRAMS));
                loadIterativeGame();
            } else {
                alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i>');
                lostAttempts();
            }
        }).set('labels', { ok: 'Si', cancel: 'No' });
}

function compareTrees() {
    if (gameTreeIF.compareTree(treeIF.getTree()[0], gameTreeIF.getTree()[0])) {
        alertify.success('¡Bien!&nbsp;<i class="far fa-smile-beam"></i><br>¡Los arboles de ambientes son iguales!');
        addPoints(gameTreeIF.countTreeNodes(treeIF.getTree()[0]));
        tryLoadComplexityGame();
    } else {
        alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i><br>¡Los arboles de ambientes no son iguales!');
        lostAttempts();
    }
}

function getRecursiveCalls() {
    var str = "" + recursiveCalls[0];
    for (let i = 1; i < recursiveCalls.length; i++) {
        const callR = recursiveCalls[i];
        str += "," + callR;
    }
    return str;
}

function addPoints(np) {
    points += np;
    if (points >= maxPointsLevel) {
        alertify.alert('<h1 class="texto-exito">¡Superaste los ' + maxPointsLevel + ' puntos máximos!&nbsp;<i class="fas fa-trophy"></i></h1>', '<p class="text-center">¡Lo Has Hecho Muy Bien! &nbsp;<i class="far fa-surprise"></i> <br> Alcanzaste el mayor puntaje del juego <br><br> ¡Ahora estás a otro nivel!</p>');
    }
    updatePointsUI();
}

function lostAttempts() {
    attempts--;
    removeAttemptsUI();
    if (attempts == 0) {
        lost();
    }
}

function lost() {
    alertify.alert('<h1 class="texto-errorSistema">¡Ya Perdiste!</h1>', '<p class="text-center">Debes estudiar el algoritmo y volver a empezar</p>');
    hideGamingUI();
}

function win() {
    alertify.alert('<h1 class="texto-exito">¡Lo has hecho muy bien!&nbsp;<i class="fas fa-smile"></i></h1>', '<p class="text-center">Tu puntaje es de:</p> <br> <h1 class="text-center border-bottom">' + points + '</h1> <br><br> <p class="text-center">¡Ya dominas este algoritmo, puedes intentar con otro o aumentarle la complejidad a este para aumentar tu puntaje!</p>');
    hideGamingUI();
}

function nextLineGame() {
    let lineTimes = parseInt(getLineGame());
    if (isNaN(lineTimes)) {
        alertify.warning('¡Advertencia!&nbsp;<i class="fas fa-exclamation-triangle"></i><br>Debes ingresar un "número" de veces');
    } else {
        if (lineCounting[lineActG] == lineTimes) {
            addPoints(lineTimes);
            alertify.success('¡Bien!&nbsp;<i class="far fa-smile-beam"></i><br>¡Siguiente línea!');
            indexLineAct++;
            updateLineGame();
        } else {
            alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i><br>Número incorrecto');
            lostAttempts();
        }
    }
}

function startIterativeGame() {
    indexLineAct = 0;
    updateLineGame();
}

function updateLineGame() {
    $("#inputLineGame").val("");
    if (indexLineAct < lineOrder.length) {
        lineActG = lineOrder[indexLineAct];
        selectActLine(lineActG);
        $("#actLineGame").text(lineActG + 1);
    } else {
        unSelectActLine();
        tryLoadComplexityGame();
    }
}

function tryLoadComplexityGame() {
    if (exampleChoosed !== undefined) {
        loadComplexityGame();
    } else {
        win();
    }
}

function startComplexityGame() {
    createDropDown();
    if (dataSpecial != undefined) {
        var element = document.getElementById("nameAlgSelected");
        katex.render("O(n^n)", element, {
            throwOnError: false
        });
    } else {
        $("#nameAlgSelected").html(nameExampleChoosed);
    }
}

function createDropDown() {
    for (var i = 0; i < allOptionsForm.length; i++) {
        document.getElementById("bestCaseOptionsItems").appendChild(createItemDropDown(i, true));
        document.getElementById("worstCaseOptionsItems").appendChild(createItemDropDown(i, false));
    }
}

function changeTextButtons(text, isbestCase) {
    var element;
    if (isbestCase) {
        element = document.getElementById("txtOpcionsBest");
        bestSelectedUser = text;
    } else {
        element = document.getElementById("txtOpcionsWorst");
        worstSelectedUser = text;
    }
    katex.render(text, element, {
        throwOnError: false
    });
}

function createItemDropDown(i, isbestCase) {
    var tagA = document.createElement("a");
    tagA.setAttribute("class", "dropdown-item");
    tagA.setAttribute("href", "javascript:changeTextButtons(allOptionsForm[" + i + "]," + isbestCase + ")");
    katex.render(allOptionsForm[i], tagA, {
        throwOnError: false
    });
    return tagA;
}

function validateComplexity() {
    if (bestSelectedUser != undefined && worstSelectedUser != undefined) {
        var answer = answersForm[exampleChoosed];
        if (answer.best == bestSelectedUser || answer.wrost == worstSelectedUser) {
            if (answer.best == bestSelectedUser && answer.wrost == worstSelectedUser) {
                addPoints(sizeObj(lineCounting) * 2);
                win();
            } else if (answer.best == bestSelectedUser) {
                alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i><br>El peor caso está mal');
                lostAttempts();
            } else {
                alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i><br>El mejor caso está mal');
                lostAttempts();
            }
        } else {
            alertify.error('¡Error!&nbsp;<i class="far fa-sad-tear"></i><br>Ninguno está bien');
            lostAttempts();
        }
    } else {
        alertify.warning('¡Advertencia!&nbsp;<i class="fas fa-exclamation-triangle"></i><br>Debe seleccionar tanto el mejor como el peor caso');
    }
}