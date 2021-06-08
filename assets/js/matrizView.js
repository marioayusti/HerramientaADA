function drawMatriz(matriz, idMatriz) {

    var htmlMatriz = '<div id="' + idMatriz + '" class="divMatrix">' +
        '<table class="table table-bordered table-sm" style="table-layout: fixed">';

    htmlMatriz += '<thead><tr><th scope="col">#</th>';
    for (var i = 0; i < matriz[0].length; i++) {
        htmlMatriz += '<th scope="col">' + (i + 1) + '</th>';
    }
    htmlMatriz += ' </tr></thead><tbody>';

    for (var i = 0; i < matriz.length; i++) {
        htmlMatriz += '<tr><th scope="row">' + (i + 1) + '</th>';
        for (var j = 0; j < matriz[0].length; j++) {
            htmlMatriz += '<td id="' + idMatriz + '-' + i + '-' + j + '">';
            htmlMatriz += '<span id="animationVariableMatirz' + idMatriz + '-' + i + '-' + j + '" style="display: block;">' + matriz[i][j] + '</span>';
            htmlMatriz += '</td>';
        }
        htmlMatriz += '</tr>';
    }

    htmlMatriz += '</tbody></table>' +
        '</div> &emsp;';

    addMatrizView(htmlMatriz);

}

function isMatriz(idMatriz) {
    let object = document.getElementById(idMatriz);
    if (object.getElementsByTagName('table').length >= 1) {
        return true;
    }
    return false;
}

function isCanvas(idMatriz) {
    let object = document.getElementById(idMatriz);
    if (object !== null && !(object.getElementsByTagName('table').length >= 1)) {
        return true;
    }
    return false;
}

function drawCell(idMatriz, i, j) {
    document.getElementById(idMatriz + '-' + i + '-' + j).setAttribute("style", "background:red");
    // setTimeout(() => {
    //     unsealCell(idMatriz,i, j);
    // }, 2000);
    // setTimeout(() => {
    //     animationChangeVariableMatriz(idMatriz,i, j);
    // }, 3000);
    // setTimeout(() => {
    //     changeValueCell(idMatriz,i, j, 999);
    // }, 4000);
}

function animationChangeVariableMatriz(idMatriz, i, j) {
    $('#animationVariableMatirz' + idMatriz + '-' + i + '-' + j).removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).removeClass();
    });
}

function unsealCell(idMatriz, i, j) {
    document.getElementById(idMatriz + '-' + i + '-' + j).removeAttribute("style");
}

function unsealAllCell(idMatriz) {
    columns = document.getElementById(idMatriz).getElementsByTagName('td');
    for (let i = 0; i < columns.length; i++) {
        document.getElementById(columns[i].id).removeAttribute("style");
    }
}

function changeValueCell(idMatriz, i, j, value) {
    document.getElementById(idMatriz + '-' + i + '-' + j).innerHTML = value;
}

function addMatrizView(htmlMatriz) {
    $('#wrapContent').append(htmlMatriz);
}

function removeViewContent(idMatriz) {
    $('#' + idMatriz).remove();
}