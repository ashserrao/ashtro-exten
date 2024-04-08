//Redirect to profile page ========================
const profileIconButton = document.getElementById("profile");

profileIconButton.onclick = function () {
  window.location = "profile.html";
};

const cardClick = document.getElementById("clickcard");

cardClick.onclick = redirect;

//redirect function=====================
function redirect() {
  chrome.windows.create({
    url: "chrome-extension://" + chrome.runtime.id + "/device.html",
    type: "popup",
    width: 690,
    height: 750,
  });
}

//  Checking for WebRTC compatiblity in the browser ========================
const rtcStat = document.getElementById("RTC-stat");
// const audioBT = document.getElementById("audio-stat");
// const videoBT = document.getElementById("video-stat");

var webrtcDetectedVersion = null;
var webrtcDetectedBrowser = null;
window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

function initWebRTCAdapter() {
  if (navigator.mozGetUserMedia) {
    webrtcDetectedBrowser = "firefox";
    webrtcDetectedVersion = parseInt(
      navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1],
      10
    );

    RTCPeerConnection = mozRTCPeerConnection;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCIceCandidate = mozRTCIceCandidate;
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);
    attachMediaStream = function (element, stream) {
      element.mozSrcObject = stream;
      element.play();
    };

    reattachMediaStream = function (to, from) {
      to.mozSrcObject = from.mozSrcObject;
      to.play();
    };

    MediaStream.prototype.getVideoTracks = function () {
      return [];
    };

    MediaStream.prototype.getAudioTracks = function () {
      return [];
    };
    return true;
  } else if (navigator.webkitGetUserMedia) {
    webrtcDetectedBrowser = "chrome";
    webrtcDetectedVersion = parseInt(
      navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2],
      10
    );

    RTCPeerConnection = webkitRTCPeerConnection;
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
    attachMediaStream = function (element, stream) {
      element.src = webkitURL.createObjectURL(stream);
    };

    reattachMediaStream = function (to, from) {
      to.src = from.src;
    };

    if (!webkitMediaStream.prototype.getVideoTracks) {
      webkitMediaStream.prototype.getVideoTracks = function () {
        return this.videoTracks;
      };
      webkitMediaStream.prototype.getAudioTracks = function () {
        return this.audioTracks;
      };
    }

    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
      webkitRTCPeerConnection.prototype.getLocalStreams = function () {
        return this.localStreams;
      };
      webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
        return this.remoteStreams;
      };
    }
    return true;
  } else return false;
}

// Trigger for WebRTC compatiblity========================
function checkWebRTC() {
  var isCompatible = initWebRTCAdapter();
  if (isCompatible) {
    rtcStat.innerText = "Compatible";
  } else {
    rtcStat.innerText = "Not Compatible";
  }
}

// //Local video Audio and video bitrate checking ===========================
// async function checkBitrate() {
//   try {
//     const audioStream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//     });
//     const videoStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//     });
//     const audioRecorder = new MediaRecorder(audioStream);
//     const videoRecorder = new MediaRecorder(videoStream);
//     const audioChunks = [];
//     const videoChunks = [];

//     audioRecorder.ondataavailable = (event) => {
//       audioChunks.push(event.data);
//     };

//     videoRecorder.ondataavailable = (event) => {
//       videoChunks.push(event.data);
//     };

//     const stopRecording = () => {
//       audioRecorder.stop();
//       videoRecorder.stop();
//     };

//     audioRecorder.onstop = () => {
//       const audioBlob = new Blob(audioChunks, { type: audioRecorder.mimeType });
//       const audioSizeInBytes = audioBlob.size;
//       const audioDurationInSeconds =
//         audioSizeInBytes / audioRecorder.audioBitsPerSecond;
//       const audioBitrate = (audioSizeInBytes * 8) / audioDurationInSeconds; // Calculate bitrate in bits per second
//       const audioinMega = audioBitrate / 1048576;
//       audioBT.innerText = `${audioinMega.toFixed(2)} Mbps`;
//     };

//     videoRecorder.onstop = () => {
//       const videoBlob = new Blob(videoChunks, { type: videoRecorder.mimeType });
//       const videoSizeInBytes = videoBlob.size;
//       const videoDurationInSeconds =
//         videoSizeInBytes / videoRecorder.videoBitsPerSecond;
//       const videoBitrate = (videoSizeInBytes * 8) / videoDurationInSeconds; // Calculate bitrate in bits per second
//       const videoinMega = videoBitrate / 1048576;
//       videoBT.innerText = `${videoinMega.toFixed(2)} Mbps`;

//       // Stop the streams and close recorders
//       audioStream.getTracks().forEach((track) => track.stop());
//       videoStream.getTracks().forEach((track) => track.stop());
//       audioRecorder = null;
//       videoRecorder = null;
//     };

//     audioRecorder.start();
//     videoRecorder.start();
//     setTimeout(stopRecording, 5000); // Record for 5 seconds
//   } catch (error) {
//     console.error("Error accessing media devices:", error);
//   }
// }

setInterval(() => {
  checkWebRTC();
  // checkBitrate();
}, 5000);
