const noRec = document.getElementById("no-rec");
const videoUrls = [];
const downloadChecked = document.getElementById("download-selected");

function retrieveVideosFromStorage() {
  chrome.storage.local.get(null, function (items) {
    if (!items) {
      noRec.innerText = "No records found!!!";
      console.log("No items");
      noRec = "No records found";
      return;
    }

    const screenVideos = Object.keys(items)
      .filter((key) => key.startsWith("screen"))
      .map((key) => items[key]);
    const webcamVideos = Object.keys(items)
      .filter((key) => key.startsWith("webcam"))
      .map((key) => items[key]);

    screenVideos.forEach((videoUrl, index) => {
      appendVideoToView(
        videoUrl,
        "screenview",
        `Screen Recording ${index + 1}`
      );
    });

    webcamVideos.forEach((videoUrl, index) => {
      appendVideoToView(
        videoUrl,
        "webcamview",
        `Webcam Recording ${index + 1}`
      );
    });
  });
}

function appendVideoToView(videoUrl, viewId, videoName) {
  const view = document.getElementById(viewId);
  const videoElement = document.createElement("video");
  const downloadButton = document.createElement("button");
  const labelElement = document.createElement("label");
  const brElement = document.createElement("br");

  videoElement.src = videoUrl;
  videoElement.controls = true;
  videoElement.preload = "metadata"; // Ensures that video duration is available for display
  view.appendChild(videoElement);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = videoName;
  checkbox.onclick = () => {
    if (checkbox.checked) {
      videoUrls.push(videoUrl);
    } else {
      const index = videoUrls.indexOf(videoUrl);
      if (index !== -1) {
        videoUrls.splice(index, 1);
      }
    }
  };
  view.appendChild(checkbox);

  downloadButton.innerText = "Download video";
  downloadButton.onclick = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${Date.now()}-${videoName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  view.appendChild(downloadButton);

  downloadChecked.onclick = () => {
    videoUrls.forEach((url, index) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${Date.now()}-video-${index + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  labelElement.innerText = videoName;
  view.appendChild(brElement);
  view.appendChild(labelElement);
}

window.onload = function () {
  retrieveVideosFromStorage();
};
