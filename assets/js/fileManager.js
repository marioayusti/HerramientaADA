function cargarArchivo() {
    var fileInput = document.getElementById("fileURLInput");
    var file = fileInput.files[0];
    var fileName = fileInput.value;
    if (file) {
        if (fileName.endsWith(".pseudo") || fileName.endsWith(".txt")) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                editor.setValue(evt.target.result, 1);
            };
            reader.onerror = function (evt) {
                alertify.error("Error al leer el archivo");
            };
        } else {
            alertify.error("¡Tipo de archivo no aceptado!");
        }
    } else {
        alertify.error("Error desconocido");
    }
}

function getNameFile() {
    alertify.prompt('Nombre del Archivo', 'Ingrese el nombre del archivo a descargar', 'algoritmo'
        , function (evt, value) {
            descargarArchivo(value);
        }
        , undefined);
}

function descargarArchivo(name) {
    var text = editor.getValue();
    var URL = window.URL || window.webkitURL;
    var a = document.createElement('a');
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    a.download = name + ".pseudo";
    a.rel = 'noopener';
    a.href = URL.createObjectURL(blob);
    a.dispatchEvent(new MouseEvent('click'));
}