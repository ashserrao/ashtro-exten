// variables =============================================
const recStatus = document.getElementById("rec-status");
let screenRecorder = null;
let webcamRecorder = null;
let creationStatus = false;

// Open IndexedDB database==================================
let db;
const request = window.indexedDB.open("RecordingsDB", 1);

request.onerror = function (event) {
  console.error("IndexedDB error:", event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;
};

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("recordings", { autoIncrement: true });
};

function onAccessApproved(screenStream, webcamStream) {
  screenRecorder = new MediaRecorder(screenStream);
  webcamRecorder = new MediaRecorder(webcamStream);

  recStatus.innerText = "You are being recorded";
  console.log("You are being recorded");
  screenRecorder.start();
  webcamRecorder.start();

  const blobs = {
    screen: [],
    webcam: [],
  };

  screenRecorder.ondataavailable = function (event) {
    blobs.screen.push(event.data);
  };

  webcamRecorder.ondataavailable = function (event) {
    blobs.webcam.push(event.data);
  };

  screenRecorder.onstop = function () {
    screenStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
        recStatus.innerText = "Recording stopped";
      }
    });
    saveRecording(blobs.screen, `screen-recording-${Date.now()}.webm`);
  };
  // stopping the video tracks==========================================
  webcamRecorder.onstop = function () {
    webcamStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    saveRecording(blobs.webcam, `webcam-recording-${Date.now()}.webm`);
  };
}

// saving video function ===================================================
function saveRecording(dataArray, filename) {
  const transaction = db.transaction(["recordings"], "readwrite");
  const objectStore = transaction.objectStore("recordings");
  const blob = new Blob(dataArray, { type: dataArray[0].type });

  // Construct an object that includes the blob data and filename
  const recordingData = {
    blob: blob,
    filename: filename,
  };

  transaction.onerror = function (event) {
    console.error("Error in transaction:", event);
  };

  // Add the recording data to the object store
  const request = objectStore.add(recordingData);

  request.onerror = function (event) {
    console.error(
      "Error saving recording to IndexedDB:",
      event.target.errorCode
    );
  };

  request.onsuccess = function (event) {
    console.log("Recording saved to IndexedDB:", filename);
  };
}

//Dom content loader ====================================================
document.addEventListener("DOMContentLoaded", () => {
  // Getting selectors of the buttons
  const startVideoButton = document.querySelector("button#exam-continue");
  const stopVideoButton = document.querySelector("button#exam-stop");

  startVideoButton.addEventListener("click", () => {
    console.log("requesting recording");
    navigator.mediaDevices
      .getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 2, // Enable stereo audio
        },
        video: {
          width: 999999999,
          height: 999999999,
        },
      })
      .then((screenStream) => {
        // Now, get user media for webcam
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 2, // Enable stereo audio
            },
          })
          .then((webcamStream) => {
            // Pass both streams to onAccessApproved
            onAccessApproved(screenStream, webcamStream);
          })
          .catch((error) => {
            console.error("Error accessing webcam", error);
          });
      })
      .catch((error) => {
        console.error("Error starting the video", error);
      });
  });

  stopVideoButton.addEventListener("click", () => {
    console.log("stopping video");
    if (!screenRecorder || !webcamRecorder) return console.log("no recording");
    screenRecorder.stop();
    webcamRecorder.stop();
  });

  //Display list of items =======================================
  const recordingList = document.getElementById("recording-list");
  const selectedDownloads = []; // Array to store selected download links
  const allDownloadedLinks = [];

  function displayRecordings() {
    const transaction = db.transaction(["recordings"], "readonly");
    const objectStore = transaction.objectStore("recordings");
    const request = objectStore.getAll();

    request.onerror = function (event) {
      console.error("Error fetching recordings:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
      const recordings = event.target.result;
      recordingList.innerHTML = ""; // Clear previous recordings

      if (recordings.length === 0) {
        const noRecordingsMessage = document.createElement("li");
        noRecordingsMessage.innerText = "No recordings found.";
        recordingList.appendChild(noRecordingsMessage);
      } else {
        recordings.forEach(function (recording, index) {
          const recordingItem = document.createElement("li");
          const downloadLink = document.createElement("a");
          const checkbox = document.createElement("input");
          const horizonLine = document.createElement("hr");

          downloadLink.href = URL.createObjectURL(recording.blob); // Use blob data
          downloadLink.download = `${recording.filename}.webm`; // Use filename
          downloadLink.innerText = `${index + 1}-${recording.filename}`; // Display filename
          allDownloadedLinks.push(downloadLink.href);

          checkbox.type = "checkbox";
          checkbox.addEventListener("change", function () {
            if (checkbox.checked) {
              selectedDownloads.push(downloadLink.href);
            } else {
              const indexToRemove = selectedDownloads.indexOf(
                downloadLink.href
              );
              if (indexToRemove !== -1) {
                selectedDownloads.splice(indexToRemove, 1);
              }
            }
          });

          // recordingItem.appendChild(checkbox);
          recordingItem.appendChild(downloadLink);
          recordingList.appendChild(recordingItem);
          recordingList.appendChild(horizonLine);
        });
      }
    };
  }

  // Display recordings when DOM is loaded
  setInterval(() => {
    displayRecordings();
  }, 5000);

  clearInterval();
});
