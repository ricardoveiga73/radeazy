// Obtenha uma referência para o armazenamento e o banco de dados
var storage = firebase.storage();
var db = firebase.firestore();

// Obtenha uma referência para o botão de gravação
var recordButton = document.getElementById("recordButton");

// Variáveis de controle do gravador
var mediaRecorder;
var chunks = [];
var timer;

// Manipulador de evento para o botão de gravação
recordButton.addEventListener("click", function() {
    if (!mediaRecorder) {
        // Inicie a gravação
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                timer = setInterval(saveRecording, 900000); // 15 minutos (900000 milissegundos)
            })
            .catch(function(error) {
                console.log("Erro ao acessar a placa de áudio: " + error);
            });

        recordButton.textContent = "Parar Gravação";
    } else {
        // Pare a gravação
        mediaRecorder.stop();
        clearInterval(timer);

        recordButton.textContent = "Gravar";
    }
});

// Manipulador de evento para o evento de dados disponíveis durante a gravação
mediaRecorder.addEventListener("dataavailable", function(event) {
chunks.push(event.data);
});

// Função para salvar a gravação no armazenamento do Firebase
function saveRecording() {
if (chunks.length > 0) {
// Crie um novo arquivo MP3
var blob = new Blob(chunks, { type: "audio/mp3" });

    // Gere um nome único para o arquivo
    var filename = "recording_" + Date.now() + ".mp3";

    // Faça o upload do arquivo para o armazenamento do Firebase
    var storageRef = storage.ref().child(filename);
    storageRef.put(blob)
        .then(function(snapshot) {
            // Obtenha a URL do arquivo
            storageRef.getDownloadURL()
                .then(function(url) {
                    // Salve a URL do arquivo no banco de dados
                    db.collection("recordings").add({
                        name: filename,
                        url: url
                    })
                    .then(function(docRef) {
                        console.log("Gravação salva com sucesso: " + docRef.id);
                    })
                    .catch(function(error) {
                        console.log("Erro ao salvar a gravação: " + error);
                    });
                })
                .catch(function(error) {
                    console.log("Erro ao obter a URL do arquivo: " + error);
                });
        })
        .catch(function(error) {
            console.log("Erro ao fazer o upload do arquivo: " + error);
        });

    // Limpe os chunks para a próxima gravação
    chunks = [];
}

