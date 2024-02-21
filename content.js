// Local Recording logic ======================================
var recorder = null;
var webcamRecorder = null;
var screenRecorder = null;
var screenCount = 0;
var webcamCount = 0;

function onAccessApproved(screenStream, webcamStream) {
  screenRecorder = new MediaRecorder(screenStream);
  webcamRecorder = new MediaRecorder(webcamStream);

  screenRecorder.start();
  webcamRecorder.start();

  var blobs = {
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
      }
    });
    var screenBlob = new Blob(blobs.screen, { type: blobs.screen[0].type });
    var screenUrl = URL.createObjectURL(screenBlob);
    saveToStorage(screenUrl, "screen");
  };

  webcamRecorder.onstop = function () {
    webcamStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    var webcamBlob = new Blob(blobs.webcam, { type: blobs.webcam[0].type });
    var webcamUrl = URL.createObjectURL(webcamBlob);
    saveToStorage(webcamUrl, "webcam");
  };

  function saveToStorage(url, key) {
    chrome.storage.local.set(
      { [`${key}${key === "screen" ? screenCount++ : webcamCount++}`]: url },
      function () {
        console.log(`Saved ${key} to storage.`);
      }
    );
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");
    sendResponse(`request-processed: ${message.action}`);
    navigator.mediaDevices
      .getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 2,
        },
        video: {
          width: 999999999,
          height: 999999999,
        },
      })
      .then((screenStream) => {
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
            onAccessApproved(screenStream, webcamStream);
            chrome.runtime.sendMessage({ action: "recording_started" });
          })
          .catch((error) => {
            console.error("Error accessing webcam", error);
          });
      })
      .catch((error) => {
        console.error("Error starting the video", error);
      });
  }

  if (message.action === "stop_recording") {
    console.log("stopping video");
    sendResponse(`request-processed: ${message.action}`);
    if (!screenRecorder || !webcamRecorder) return console.log("no recording");
    screenRecorder.stop();
    webcamRecorder.stop();
  }
});

// Key Blocker Compoenent======================================
document.addEventListener("DOMContentLoaded", function () {
  let spaceCount = 0;
  const body = document.querySelector("body");

  // block content function ----------------------
  const blockContent = () => {
    body.style.opacity = "0";
  };

  // unblock content function ----------------------

  const unBlockContent = () => {
    body.style.opacity = "1";
  };

  // keydown event listener --------------------------
  document.addEventListener("keydown", function (e) {
    if (e.altKey && "tab".indexOf(e.key) !== -1) {
      let value = {
        remark: `Content blocked since the candidate pressed alt and ${e.key} key which is not allowed.`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (
      (e.metaKey && e.key == "PrintScreen") ||
      e.key == "PrintScreen"
    ) {
      let value = {
        remark: `Content blocked since the candidate tried to print the screen`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (e.ctrlKey && e.shiftKey) {
      let value = {
        remark: `Content blocked since the candidate pressed ctrl and ${e.key}`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (e.shiftKey && e.metaKey) {
      let value = {
        remark: `Content blocked since the candidate pressed shift and ${e.metaKey}`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (e.ctrlKey && e.shiftKey && "34".indexOf(e.key)) {
      let value = {
        remark: `Pressed ctrl key, shift key and ${e.key} key`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (
      [
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "meta",
        "control",
        "alt",
        "shift",
        "Escape",
        "escape",
      ].includes(e.key)
    ) {
      blockContent();
      let value = {
        remark: `Content blocked since the candidate pressed ${e.key} key which is not allowed.`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (
      [
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "F10",
        "F11",
        "F12",
      ].includes(e.key)
    ) {
      let value = {
        remark: `Content blocked since the candidate pressed ${e.key} key which is not allowed.`,
        url: window.location.href,
      };
      actionLogger(JSON.stringify(value));
    } else if (e.ctrlKey && "cvxspwuaz".indexOf(e.key) !== -1) {
      let value = {
        remark: `Content blocked since the candidate pressed ctrl key and ${e.key}`,
        url: window.location.href,
      };
      disabledEvent(e);
      actionLogger(JSON.stringify(value));
    } else if (e.key === " ") {
      spaceCount++;
      if (spaceCount === 2) {
        unBlockContent();
        spaceCount = 0;
      }
    } else {
      console.log("Keydown event failed", e);
    }
  });

  //logging trigger===================================
  function actionLogger(msg) {
    let message = {
      data: "AI",
      msg: `${msg}`,
    };
    chrome.runtime.sendMessage(message, (response) => {
      console.log(`${response},${msg}`);
    });
  }
});

// Candidate details initial trigger ===============================
chrome.runtime.sendMessage("getCandidateData", (response) => {
  setTimeout(() => {
    console.log("Event-trigger");
  }, 2000);
});

chrome.runtime.sendMessage("getRamLoad", (response) => {
  setTimeout(() => {
    console.log("getting RAM Load", response);
  }, 2000);
});

// disabled event function =============================
function disabledEvent(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  } else if (window.event) {
    window.event.cancelBubble = true;
  } else {
    e.preventDefault();
    return false;
  }
}

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
