var parser;
var program;
var callStack = [];
var auxLineCreation;
var autoExecuteID;
var skipAll = false;
var log;

//Variable de ambiente: Representa el ambiente actual
var subprogram = {
    name: undefined,
    statementsBlockStack: [],
    statementIndex: [],
    localVariables: {},
    parameters: {},
    returnVariable: undefined,
    skipExecution: undefined,
    VarsVisualized: undefined,
    getAct: function () {
        return {
            name: this.name,
            statementsBlockStack: this.statementsBlockStack,
            statementIndex: this.statementIndex,
            localVariables: this.localVariables,
            parameters: this.parameters,
            returnVariable: this.returnVariable,
            skipExecution: this.skipExecution,
            VarsVisualized: this.VarsVisualized
        };
    },
    reset: function () {
        this.name = undefined;
        this.statementsBlockStack = [];
        this.statementIndex = [];
        this.localVariables = {};
        this.parameters = {};
        this.returnVariable = undefined;
        this.skipExecution = false;
        this.VarsVisualized = [];
    },
    actStatement: function () {
        return last(this.statementsBlockStack)[last(this.statementIndex)];
    },
    addBlock: function (block) {
        this.statementsBlockStack.push(block);
        this.statementIndex.push(0);
        this.validateNextStatement();
    },
    popBlock: function () {
        this.statementsBlockStack.pop();
        this.statementIndex.pop();
    },
    finishBlock: function () {
        this.popBlock();
        locateNextStatement();
    },
    changeBlock: function (newBlock) {
        this.popBlock();
        this.addBlock(newBlock);
    },
    hasStatements: function () {
        return this.statementsBlockStack.length > 0;
    },
    incStatement: function () {
        incLast(this.statementIndex);
    },
    nextStatement: function () {
        this.incStatement();
        this.validateNextStatement();
    },
    validateNextStatement: function () {
        let Statement = this.actStatement();
        if (Statement !== undefined &&
            (Statement.type == "RepeatUntilStatement" ||
                Statement.type == "ForStatementIteration")) {
            this.addBlock(Statement.body);
            return;
        }
        locateNextStatement();
    }
};

//Lee el archivo de la gramatica y crea el parser
$.get('../assets/gramatica.pegjs', (gramatica) => {
    parser = peg.generate(gramatica);
}, "text");

//Análisis del pseudo-código y devuelve el programa en estructura de datos (objetos)
function analyzeProgram() {
    try {
        program = parser.parse(editor.getValue());
        editorSession.clearAnnotations();
        deleteMarker(actErrorMarker);
    } catch (err) {
        program = undefined;
        editorSession.setAnnotations([{
            row: err.location.start.line - 1,
            column: err.location.start.column - 1,
            text: err.message,
            type: "error"
        }]);
        deleteMarker(actErrorMarker);
        actErrorMarker = editorSession.addMarker(new Range(err.location.start.line - 1, err.location.start.column - 1, err.location.end.line - 1, err.location.end.column - 1), "ace_underline_error", "text");
    }
}

//Se inicializa el programa en el ambiente "main"
function startProgram(mainName) {
    var actSubprogram = program.SUBPROGRAMS[mainName];
    if (sizeObj(actSubprogram.params) > 0) {
        alertify.error('La subrutina inicial no debe tener parametros.');
    } else {
        for (var idVar in program.GLOBALS) {
            program.GLOBALS[idVar].value = evalExpression(program.GLOBALS[idVar].value);
        }
        if (alertify.selectMainSubprogram) {
            alertify.selectMainSubprogram().close();
        }
        showRunningUI();
        treeIF.resetTree();
        callStack = [];
        subprogram.reset();
        subprogram.name = mainName;
        subprogram.skipExecution = actSubprogram.skipV;
        createLocalVariables(actSubprogram.localVars, actSubprogram.params, undefined, undefined, actSubprogram.varsToShow);
        treeIF.changeText(getLocalVariablesString());
        subprogram.addBlock(actSubprogram.body);
        showAllVariables();
        lineCounting = {};
        initializeBreakPointCount();
    }
}

//Iniciar ejecución automática 
function startAutoExecute() {
    var exeSpd = getUISpeed();
    autoExecuteID = setInterval(executeStatement, exeSpd);
}

//Cambio de velocidad
function changeSpeed(spd) {
    var exeSpd = VELOCIDADNORMALMS / spd;
    pauseAutoExecute();
    autoExecuteID = setInterval(executeStatement, exeSpd);
}

//Si se está en ejecución automática, la pausa
function tryPauseAutoExecute() {
    if (autoExecuteID !== undefined) {
        pauseAutoExecute();
        pauseUI();
        return true;
    }
}

//Pausa la ejecución automática
function pauseAutoExecute() {
    clearInterval(autoExecuteID);
    autoExecuteID = undefined;
}

//Detiene toda la ejecución
function stopExecution() {
    tryPauseAutoExecute();
    hideRunningUI();
}

//Ejecuta una sentencia dependiendo del tipo
function executeStatement() {
    var Statement = subprogram.actStatement();
    countLine(Statement.line);
    switch (Statement.type) {
        case "IfStatement":
            if (evalExpression(Statement.test)) {
                subprogram.incStatement();
                subprogram.addBlock(Statement.consequent);
                return;
            } else if (Statement.alternate !== undefined) {
                subprogram.incStatement();
                subprogram.addBlock(Statement.alternate);
                return;
            }
            break;
        case "SwitchStatement":
            subprogram.incStatement();
            subprogram.addBlock(Statement.cases);
            return;
        case "CaseSwitchStatement":
            if (Statement.caseVal == evalExpression(Statement.exp)) {
                subprogram.changeBlock(Statement.block);
                return;
            }
            break;
        case "DefaultCaseSwitchStatement":
            subprogram.changeBlock(Statement.block);
            return;
        case "WhileStatement":
        case "RepeatUntilStatement":
            if (evalExpression(Statement.test)) {
                subprogram.addBlock(Statement.body);
                return;
            }
            break;
        case "ForStatement":
            subprogram.incStatement();
            AssignmentFunction(Statement.varFor, Statement.iniValue);
            if (Statement.inc > 0) {
                if (getVariableValue(Statement.varFor.id) > evalExpression(Statement.finValue)) {
                    locateNextStatement();
                    return;
                }
            } else {
                if (getVariableValue(Statement.varFor.id) < evalExpression(Statement.finValue)) {
                    locateNextStatement();
                    return;
                }
            }
            subprogram.addBlock([{
                type: "ForStatementIteration",
                varFor: Statement.varFor,
                finValue: Statement.finValue,
                inc: Statement.inc,
                body: Statement.body,
                line: Statement.line
            }]);
            return;
        case "ForStatementIteration":
            incVariable(Statement.varFor.id, Statement.inc);
            if ((Statement.inc > 0 && (getVariableValue(Statement.varFor.id) > evalExpression(Statement.finValue))) ||
                (Statement.inc < 0 && (getVariableValue(Statement.varFor.id) < evalExpression(Statement.finValue)))) {
                subprogram.finishBlock();
                return;
            }
            subprogram.addBlock(Statement.body);
            return;
        case "AssignmentStatement":
            if (!AssignmentFunction(Statement.left, Statement.right)) {
                return;
            }
            break;
        case "PushStatement":
        case "EnqueueStatement":
        case "AddStatement":
        case "AddLastStatement":
            DataStructurePush(Statement.DSVar.id, Statement.exp, Statement.type);
            break;
        case "AddFirstStatement":
            DataStructureAddFirst(Statement.DSVar.id, Statement.exp);
            break;
        case "CallExpression":
            subprogram.incStatement();
            callSubprogram(Statement.callee, Statement.arguments);
            return;
        case "SwapFunction":
            swapVariables(Statement.left, Statement.right);
            break;
        case "ReturnStatement":
            returnSubprogram(evalExpression(Statement.exp));
            return;
        case "PrintFunction":
            PrintFunction(evalExpression(Statement.exp));
            break;
        case "ShowFunction":
            ShowFunction(evalExpression(Statement.exp));
            break;
        case "ExpressionStatement":
            evalExpression(Statement.exp);
            break;
        case "BreakStatement":
            subprogram.finishBlock();
            return;
        default:
            alert("falta Statement: " + Statement.type);
            break;
    }
    subprogram.nextStatement();
}

//Ubica la siguiente sentencia (y su línea) a ejecutar
function locateNextStatement() {
    if (subprogram.hasStatements()) {
        let Statement = subprogram.actStatement();
        if (Statement == undefined) {
            subprogram.finishBlock();
        } else if (subprogram.skipExecution || skipAll) {
            executeStatement();
        }
        else {
            selectActLine(Statement.line);
        }
    } else {
        returnSubprogram();
    }
}

//Ejecuta el llamado a una nueva subrutina
function callSubprogram(name, args) {
    var actSubprogram = program.SUBPROGRAMS[name];
    var argsValues = evalArgs(args);
    callStack.push(subprogram.getAct());
    let isR = subprogram.name == name;
    subprogram.reset();
    subprogram.name = name;
    subprogram.skipExecution = actSubprogram.skipV;
    createLocalVariables(actSubprogram.localVars, actSubprogram.params, args, argsValues, actSubprogram.varsToShow);
    if (skipAll && isR && recursiveCalls.indexOf(name) == -1) { recursiveCalls.push(name); }
    treeIF.addCircle(getLocalVariablesString(), name, isR);
    subprogram.addBlock(actSubprogram.body);
    updateLocalVariables();
    updateCountBreakPoints();
}

//Evalua los argumento que se le envían a la nueva subrutina llamada
function evalArgs(args) {
    var argsValues = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        argsValues[i] = evalExpression(arg);
    }
    return argsValues;
}

//Crea (o instancia) las variables locales y parámetros de una nueva subrutina (o ambiente)
function createLocalVariables(localVars, params, args, argsValues, VarsToShow) {
    for (let [id, param] of Object.entries(params)) {
        let value;
        if (param.mode == "s") {
            value = getDefaultValueToParam(param.dataType, argsValues[param.pos]);
        } else {
            value = argsValues[param.pos];
            if (param.mode == "e" && Array.isArray(value)) {
                value = cloneArray(value);
            }
        }
        subprogram.localVariables[id] = {
            dataType: param.dataType,
            value: value
        };
        subprogram.parameters[id] = {
            idCaller: args[param.pos].id,
            mode: param.mode
        };
    }
    for (let [key, lVar] of Object.entries(localVars)) {
        auxLineCreation = lVar.line;
        subprogram.localVariables[key] = {
            dataType: lVar.dataType,
            value: evalExpression(lVar.value)
        };
    }
    auxLineCreation = undefined;
    showSelectionVarsVisualizer(VarsToShow);
}

//Obtiene el Id y valor de las variables locales y parámetros de la subrutina actual y los devuelve como un string
function getLocalVariablesString() {
    var textParams = "Parámetros: <br>";
    var textLocalVars = "Variables Locales: <br>";
    for (let [id, Var] of Object.entries(subprogram.localVariables)) {
        if (typeof subprogram.parameters[id] !== "undefined") {
            textParams += id + " : " + getStringValue(Var.dataType, Var.value) + "<br>";
        } else {
            textLocalVars += id + " : " + getStringValue(Var.dataType, Var.value) + "<br>";
        }
    }
    return textParams + textLocalVars;
}

//Ejecuta la sentencia de return
function returnSubprogram(returnExpValue) {
    var callerSubprogram = callStack.pop();
    if (callerSubprogram == undefined) {
        if (!skipAll) {
            disableExecutionUI();
            alertify.success("¡Fin del programa!", 5);
        }
    } else {
        subprogram.name = callerSubprogram.name;
        subprogram.skipExecution = callerSubprogram.skipExecution;
        subprogram.statementsBlockStack = callerSubprogram.statementsBlockStack;
        subprogram.statementIndex = callerSubprogram.statementIndex;
        resetVisualizer();
        subprogram.VarsVisualized = callerSubprogram.VarsVisualized;
        showVariablesVisualizer();
        for (let [idAct, param] of Object.entries(subprogram.parameters)) {
            if (param.mode == "s" || param.mode == "es") {
                callerSubprogram.localVariables[param.idCaller].value = subprogram.localVariables[idAct].value;
            }
        }
        subprogram.localVariables = callerSubprogram.localVariables;
        subprogram.parameters = callerSubprogram.parameters;
        if (returnExpValue !== undefined) {
            changeValueExpVariableAccess(callerSubprogram.returnVariable, returnExpValue);
            subprogram.returnVariable = undefined;
        }
        treeIF.disableCircle();
        locateNextStatement();
        updateLocalVariables();
        updateCountBreakPoints();
    }
}

//Lanza una excepción cuando se detecta un error en el programa
function throwException(txt) {
    stopExecution();
    let linea;
    if (subprogram.hasStatements()) {
        linea = " línea: " + (subprogram.actStatement().line + 1);
    } else {
        linea = " línea: " + (auxLineCreation + 1);
    }
    alertify.error(txt + linea, 15);
    alertify.warning("¡Cierre forzado del programa!");
    throw txt + linea;
}

//Evalua una expresión
function evalExpression(exp) {
    if (exp.type === undefined) {
        return exp;
    }
    switch (exp.type) {
        case "Literal":
            return exp.value;
        case "ArrayLiteral":
            var arr = cloneArray(exp.arr);
            if (checkArrayDimensions(arr, getArrayIndex(exp.d))) {
                return arr;
            }
            return throwException("Las dimensiones no coinciden");
        case "EmptyArray":
            return [];
        case "ArrayCreation":
            return createNewArray(getArrayIndex(exp.d), exp.valueDefault);
        case "Variable":
            return getVariableValue(exp.id);
        case "ArrayAccess":
            return getArrayAccessValue(exp);
        case "int":
            return getValidatedNumberExpression(evalIntExpression(exp));
        case "float":
            return getValidatedNumberExpression(evalFloatExpression(exp));
        case "boolean":
            return evalBooleanExpression(exp);
        case "FloorFunction":
            return Math.floor(evalExpression(exp.exp));
        case "CeilingFunction":
            return Math.ceil(evalExpression(exp.exp));
        case "CastingIntFunction":
            return parseInt(evalExpression(exp.exp));
        case "PowFunction":
            return getValidatedNumberExpression(powFunction(evalExpression(exp.base), evalExpression(exp.exp)));
        case "SqrtFunction":
            return getValidatedNumberExpression(sqrtFunction(evalExpression(exp.base)));
        case "ArrayLengthFunction":
            return getVariableValue(exp.arrVar.id).length;
        case "StringLengthFunction":
            return getVariableValue(exp.strVar.id).length;
        case "StringConcatenation":
            return evalStringConcatenation(exp.exps);
        case "CharAtFunction":
            return getCharAt(exp);
        case "SizeFunction":
            return getVariableValue(exp.DSVar.id).length;
        case "IsEmptyFunction":
            return IsEmptyDataStructureFunction(getVariableValue(exp.DSVar.id));
        case "PopExpression":
            return RemoveLastDSFunction(exp.StackVar.id, "La pila está vacía");
        case "PeekExpression":
            return GetLastDSFunction(exp.StackVar.id, "La pila está vacía");
        case "DequeueExpression":
            return RemoveFirstDSFunction(exp.QueueVar.id, "La cola está vacía");
        case "FrontExpression":
            return GetFirstDSFunction(exp.QueueVar.id, "La cola está vacía");
        case "IndexFunction":
            return IndexOfFunction(getVariableValue(exp.ListVar.id), evalExpression(exp.element));
        case "RemoveElementByIndexExpression":
            return RemoveElementByIndexFunction(exp.ListVar.id, evalExpression(exp.index));
        case "RemoveElementExpression":
            return RemoveElementFunction(exp.ListVar.id, evalExpression(exp.element));
        case "RemoveFirstExpression":
            return RemoveFirstDSFunction(exp.ListVar.id, "La lista está vacía");
        case "RemoveLastExpression":
            return RemoveLastDSFunction(exp.ListVar.id, "La lista está vacía");
        case "GetElementByIndexExpression":
            return GetElementByIndexFunction(getVariableValue(exp.ListVar.id), evalExpression(exp.index));
        case "GetFirstExpression":
            return GetFirstDSFunction(exp.ListVar.id, "La lista está vacía");
        case "GetLastExpression":
            return GetLastDSFunction(exp.ListVar.id, "La lista está vacía");
        case "DSContainsFunction":
            return ContainsFunction(getVariableValue(exp.DSVar.id), evalExpression(exp.element));
        case "StringContainsFunction":
            return getVariableValue(exp.strVar.id).includes(evalExpression(exp.strExp));
        case "AbsoluteValueFunction":
            return Math.abs(evalExpression(exp.numExp));
        default:
            alert("Falta la expresión: " + exp.type);
            break;
    }
}

//Evaluación de las operaciones enteras
function evalIntExpression(IntExp) {
    switch (IntExp.operator) {
        case "+":
            return parseInt(evalExpression(IntExp.left) + evalExpression(IntExp.right));
        case "-":
            return parseInt(evalExpression(IntExp.left) - evalExpression(IntExp.right));
        case "*":
            return parseInt(evalExpression(IntExp.left) * evalExpression(IntExp.right));
        case "/":
            return parseInt(evalExpression(IntExp.left) / evalExpression(IntExp.right));
        case "%":
            return parseInt(evalExpression(IntExp.left) % evalExpression(IntExp.right));
        default:
            alert("falta op: " + IntExp.operator);
            break;
    }
}

//Evaluación de las operaciones de punto flotante
function evalFloatExpression(floatExp) {
    switch (floatExp.operator) {
        case "+":
            return parseFloat(evalExpression(floatExp.left) + evalExpression(floatExp.right));
        case "-":
            return parseFloat(evalExpression(floatExp.left) - evalExpression(floatExp.right));
        case "*":
            return parseFloat(evalExpression(floatExp.left) * evalExpression(floatExp.right));
        case "/":
            return parseFloat(evalExpression(floatExp.left) / evalExpression(floatExp.right));
        case "%":
            return parseFloat(evalExpression(floatExp.left) % evalExpression(floatExp.right));
        default:
            alert("falta op: " + floatExp.operator);
            break;
    }
}

//Potencia
function powFunction(x, y) {
    return Math.pow(x, y);
}

//Raíz cuadrada
function sqrtFunction(x) {
    return Math.sqrt(x);
}

//Revisa que si se obtenga un número
function getValidatedNumberExpression(num) {
    if (isNaN(num)) {
        throwException("La expresión no es numérica.");
    }
    return num;
}

//Evaluación de las operaciones lógicas
function evalBooleanExpression(booleanExp) {
    switch (booleanExp.operator) {
        case "<=":
            return evalExpression(booleanExp.left) <= evalExpression(booleanExp.right);
        case ">=":
            return evalExpression(booleanExp.left) >= evalExpression(booleanExp.right);
        case ">":
            return evalExpression(booleanExp.left) > evalExpression(booleanExp.right);
        case "<":
            return evalExpression(booleanExp.left) < evalExpression(booleanExp.right);
        case "==":
            return evalExpression(booleanExp.left) == evalExpression(booleanExp.right);
        case "!=":
            return evalExpression(booleanExp.left) != evalExpression(booleanExp.right);
        case "and":
            if (evalExpression(booleanExp.left)) {
                return evalExpression(booleanExp.right);
            }
            return false;
        case "or":
            if (!evalExpression(booleanExp.left)) {
                return evalExpression(booleanExp.right);
            }
            return true;
        case "not":
            return !evalExpression(booleanExp.argument);
        default:
            alert("falta op: " + booleanExp.operator);
            break;
    }
}

//Evalua la concatenación
function evalStringConcatenation(exps) {
    var str = "";
    for (let i = 0; i < exps.length; i++) {
        const exp = exps[i];
        str += evalExpression(exp);
    }
    return str;
}

//Obtiene el caracter de un string en la posición definida
function getCharAt(exp) {
    var strV = evalExpression(exp.strVar);
    var index = evalExpression(exp.index);
    if (index <= 0) {
        throwException("No puede acceder a un indice menor a 0");
    }
    return strV.charAt(index - 1);
}

//Imprime información
function PrintFunction(exp) {
    console.log(exp);
}

//Muestra información por interfaz
function ShowFunction(text) {
    if (!skipAll) {
        alertify.alert("Alert", '<p class="text-center">' + text + '</p>');
    }
}

//Ejecuta la sentencia de asignación
function AssignmentFunction(left, right) {
    if (right.callee == undefined) {
        changeValueExpVariableAccess(left, evalExpression(right));
        return true;
    } else {
        subprogram.incStatement();
        subprogram.returnVariable = left;
        callSubprogram(right.callee, right.arguments);
        return false;
    }
}

// -------------------- Operaciones sobre estructuras de datos --------------------

//Añade un elemento en la última posición
function DataStructurePush(id, exp, typeAction) {
    var expValue = evalExpression(exp);
    if (checkIsOnVisualizer(id)) {
        if (typeAction == "PushStatement") {
            pushStackVisualizer(id, expValue);
        } else if (typeAction == "EnqueueStatement") {
            enqueueQueueVisualizer(id, expValue);
        }
    }
    getVariableValue(id).push(expValue);
    updateVariableValue(id);
}

//Añade en la primera posición
function DataStructureAddFirst(id, exp) {
    getVariableValue(id).unshift(evalExpression(exp));
    updateVariableValue(id);
}

//Remueve un elemento especifico
function RemoveElementFunction(id, element) {
    let dataStructure = getVariableValue(id);
    if (ContainsFunction(dataStructure, element)) {
        let index = dataStructure.indexOf(element);
        dataStructure.splice(index, 1);
        updateVariableValue(id);
        return true;
    } else {
        return false;
    }
}

//Remueve un elemento en una posición dada
function RemoveElementByIndexFunction(id, index) {
    let dataStructure = getVariableValue(id);
    if (index > 0 && index <= dataStructure.length) {
        let returned = dataStructure.splice(index - 1, 1);
        updateVariableValue(id);
        return returned;
    } else {
        throwException("El índice sobre pasa las dimensiones de la lista");
    }
}

//Remueve el primer elemento
function RemoveFirstDSFunction(id, EMPTYEXCEPTION) {
    let dataStructure = getVariableValue(id);
    if (IsEmptyDataStructureFunction(dataStructure)) {
        throwException(EMPTYEXCEPTION);
    }
    let returned = dataStructure.shift();
    updateVariableValue(id);
    dequeueQueueVisualizer(id);
    return returned;
}

//Remueve el último elemento
function RemoveLastDSFunction(id, EMPTYEXCEPTION) {
    let dataStructure = getVariableValue(id);
    if (IsEmptyDataStructureFunction(dataStructure)) {
        throwException(EMPTYEXCEPTION);
    }
    let returned = dataStructure.pop();
    updateVariableValue(id);
    popStackVisualizer(id);
    return returned;
}

//Obtiene el elemento en la posición dada
function GetElementByIndexFunction(dataStructure, index) {
    if (index > 0 && index <= dataStructure.length) {
        return dataStructure[index - 1];
    } else {
        throwException("El índice sobre pasa las dimensiones de la lista");
    }
}

//Obtiene el primer elemento
function GetFirstDSFunction(id, EMPTYEXCEPTION) {
    let dataStructure = getVariableValue(id);
    if (IsEmptyDataStructureFunction(dataStructure)) {
        throwException(EMPTYEXCEPTION);
    }
    return dataStructure[0];
}

//Obtiene el último elemento
function GetLastDSFunction(id, EMPTYEXCEPTION) {
    let dataStructure = getVariableValue(id);
    if (IsEmptyDataStructureFunction(dataStructure)) {
        throwException(EMPTYEXCEPTION);
    }
    return last(dataStructure);
}

//Retorna true si contiene un elemento
function ContainsFunction(dataStructure, element) {
    return IndexOfFunction(dataStructure, element) > 0;
}

//Retorna el indice de un elemento
function IndexOfFunction(dataStructure, element) {
    return dataStructure.indexOf(element) + 1;
}

//Retorna true si es vacia
function IsEmptyDataStructureFunction(dataStructure) {
    return dataStructure.length == 0;
}

// --------------------------------------------------------------------------------

//Ejecuta la sentencia de swap (intercambio de los variables de dos variables)
function swapVariables(left, right) {
    let swapMaked = visualizeswapArrayCanvas(left, right);
    var leftV = getValueExpVariableAccess(left, true);
    changeValueExpVariableAccess(left, getValueExpVariableAccess(right, true), swapMaked);
    changeValueExpVariableAccess(right, leftV, swapMaked);
}

//Incremento
function incVariable(id, inc) {
    changeVariableValue(id, getVariableValue(id) + inc);
}

//Obtiene el valor de una acceso a variable
function getValueExpVariableAccess(exp, skipBySwap) {
    if (exp.type == "ArrayAccess") {
        return getArrayAccessValue(exp, skipBySwap);
    } else {
        return getVariableValue(exp.id);
    }
}

//Cambia el valor de una acceso a variable
function changeValueExpVariableAccess(exp, value, vsChange) {
    if (exp.type == "ArrayAccess") {
        visualizeArrayChangeValue(exp, value, vsChange);
        changeArrayAccessValue(exp.id, getArrayIndex(exp.index), value);
    } else {
        changeVariableValue(exp.id, value);
    }
}

//Cambia el valor de una variable
function changeVariableValue(id, value) {
    getVariable(id).value = value;
    visualizeVariableChange(id, value);
    updateVariableValue(id);
}

//Cambia el valor de una posición del arreglo
function changeArrayAccessValue(id, index, value) {
    var arrV = getVariable(id).value;
    for (let i = 0; i < index.length; i++) {
        if (index[i] < 1) {
            throwException("La primera posición de los arreglos es 1.");
        } else if (index[i] > arrV.length) {
            throwException("El indice sobrepasa la longitud del arreglo.");
        }
        if (i === index.length - 1) {
            arrV[index[i] - 1] = value;
        } else {
            arrV = arrV[index[i] - 1];
        }
    }
    updateVariableValue(id);
}

//Obtiene el valor de una variable
function getVariableValue(id) {
    return getVariable(id).value;
}

//Obtiene el tipo de dato de una variable
function getVariableDataType(id) {
    return getVariable(id).dataType;
}

//Obtiene el valor de una posición de un arreglo
function getArrayAccessValue(exp, skipBySwap) {
    let index = getArrayIndex(exp.index);
    let arrV = getVariable(exp.id).value;
    for (let i = 0; i < index.length; i++) {
        if (index[i] < 1) {
            throwException("La primera posición de los arreglos es 1.");
        } else if (index[i] > arrV.length) {
            throwException("El indice sobrepasa la longitud del arreglo.");
        } else {
            arrV = arrV[index[i] - 1];
        }
    }
    if (skipBySwap == undefined) {
        visualizeArrayAccess(exp, index);
    }
    return arrV;
}

//Retorna el objeto de una variable
function getVariable(id) {
    var Var = subprogram.localVariables[id];
    if (typeof Var == "undefined") {
        Var = program.GLOBALS[id];
    }
    return Var;
}

//Retorna el alcance de una variable (Local o Global)
function getVariableScope(id) {
    if (typeof subprogram.localVariables[id] !== "undefined") {
        return "L";
    }
    return "G";
}

//Obtiene la última posición de un arreglo
function last(arr) {
    return arr[arr.length - 1];
}

//Incrementa el valor de la última posición de un arreglo
function incLast(arr) {
    arr[arr.length - 1]++;
}

//Devuelve el tamaño de un objeto
function sizeObj(obj) {
    return Object.keys(obj).length;
}

//Devuelve una copia de un arreglo
function cloneArray(arr) {
    if (Array.isArray(arr)) {
        var i, copy;
        copy = arr.slice(0);
        for (i = 0; i < copy.length; i++) {
            copy[i] = cloneArray(copy[i]);
        }
        return copy;
    } else {
        return arr;
    }
}

//Evalua las expresiones enteras de un arreglo
function getArrayIndex(index) {
    var newIndex = [];
    for (let i = 0; i < index.length; i++) {
        const indexExp = index[i];
        newIndex[i] = evalExpression(indexExp);
    }
    return newIndex;
}

//Crea un nuevo arreglo (unidimensional o bidimensional)
function createNewArray(dimensions, value) {
    if (dimensions.length > 0) {
        var dim = dimensions[0];
        var rest = dimensions.slice(1);
        var newArray = [];
        if (dim > 0) {
            for (var i = 0; i < dim; i++) {
                newArray[i] = createNewArray(rest, value);
            }
        } else {
            throwException("No se puede crear un arreglo con tamaño menor a 1");
        }
        return newArray;
    } else {
        return value;
    }
}

//Revisa que el arreglo tenga correcta las dimensiones
function checkArrayDimensions(array, dimensions) {
    var dim = dimensions[0];
    var rest = dimensions.slice(1);
    if (array.length != dim) {
        return false;
    }
    for (var i = 0; i < dim; i++) {
        if (rest.length > 0 && Array.isArray(array[i])) {
            if (!checkArrayDimensions(array[i], rest)) {
                return false;
            }
        } else if (Array.isArray(array[i])) {
            return false;
        }
    }
    return true;
}

//Obtiene las dimensiones de un arreglo
function getArrayDimensions(array) {
    let dimensions = [];
    dimensions[0] = array.length;
    if (Array.isArray(array[0])) {
        dimensions[1] = array[0].length;
    }
    return dimensions;
}

//Obtiene el valor por defecto de una tipo de variable
function getDefaultValueToParam(dataType, value) {
    switch (dataType) {
        case "string":
        case "char":
            return "";
        case "float":
        case "int":
            return 0;
        case "boolean":
            return true;
    }
    if (dataType.includes("lista") || dataType.includes("pila") || dataType.includes("cola")) {
        return [];
    } else if (dataType.includes("[][]")) {
        return createNewArray(getArrayDimensions(value), getDefaultValueToParam(dataType.slice(0, -4)));
    } else if (dataType.includes("[]")) {
        return createNewArray(getArrayDimensions(value), getDefaultValueToParam(dataType.slice(0, -2)));
    }
}