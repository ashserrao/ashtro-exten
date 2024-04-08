navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  })
  .then((stream) => {
    document.getElementById("live").srcObject = stream;
    document.getElementById("camera").src = "./assets/loaded.svg";
    document.getElementById("microphone").src = "./assets/loaded.svg";
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
    document.getElementById("camera").src = "/assets/cross_mark.svg";
    document.getElementById("microphone").src = "/assets/cross_mark.svg";
  });

const beginSystemCheck = document.getElementById("exam-continue");

function redirect() {
  window.location = "./recording.html";
}

beginSystemCheck.onclick = redirect;

//Local video Audio and video bitrate checking ===========================

const audioBT = document.getElementById("audio-stat");
const videoBT = document.getElementById("video-stat");

async function checkBitrate() {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const audioRecorder = new MediaRecorder(audioStream);
    const videoRecorder = new MediaRecorder(videoStream);
    const audioChunks = [];
    const videoChunks = [];

    audioRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    videoRecorder.ondataavailable = (event) => {
      videoChunks.push(event.data);
    };

    const stopRecording = () => {
      audioRecorder.stop();
      videoRecorder.stop();
    };

    audioRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: audioRecorder.mimeType });
      const audioSizeInBytes = audioBlob.size;
      const audioDurationInSeconds =
        audioSizeInBytes / audioRecorder.audioBitsPerSecond;
      const audioBitrate = (audioSizeInBytes * 8) / audioDurationInSeconds; // Calculate bitrate in bits per second
      const audioinMega = audioBitrate / 1048576;
      audioBT.innerText = `${audioinMega.toFixed(2)} Mbps`;
    };

    videoRecorder.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: videoRecorder.mimeType });
      const videoSizeInBytes = videoBlob.size;
      const videoDurationInSeconds =
        videoSizeInBytes / videoRecorder.videoBitsPerSecond;
      const videoBitrate = (videoSizeInBytes * 8) / videoDurationInSeconds; // Calculate bitrate in bits per second
      const videoinMega = videoBitrate / 1048576;
      videoBT.innerText = `${videoinMega.toFixed(2)} Mbps`;

      // Stop the streams and close recorders
      audioStream.getTracks().forEach((track) => track.stop());
      videoStream.getTracks().forEach((track) => track.stop());
      audioRecorder = null;
      videoRecorder = null;
    };

    audioRecorder.start();
    videoRecorder.start();
    setTimeout(stopRecording, 5000); // Record for 5 seconds
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
}

setInterval(() => {
  checkBitrate();
}, 5000);

clearInterval();