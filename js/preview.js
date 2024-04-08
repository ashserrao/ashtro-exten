document.addEventListener("DOMContentLoaded", () => {
  const recordingList = document.getElementById("recording-list");

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

      recordings.forEach(function (recording, index) {
        const recordingItem = document.createElement("li");
        const downloadLink = document.createElement("a");

        downloadLink.href = URL.createObjectURL(recording);
        downloadLink.download = `recording-${index}.webm`;
        downloadLink.innerText = `Recording ${index + 1}`;

        recordingItem.appendChild(downloadLink);
        recordingList.appendChild(recordingItem);
      });
    };
  }

  // Display recordings when DOM is loaded
  setInterval(() => {
    displayRecordings();
  }, 2000);

  clearInterval();
});
