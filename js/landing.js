//Redirect to profile page ========================
const profileIconButton = document.getElementById("profile");

profileIconButton.onclick = function () {
  window.location = "profile.html";
};

//Start system check =========================
const beginSystemCheck = document.getElementById("begin-system-check");

function redirect() {
  window.location = "./hardConfig.html";
}

beginSystemCheck.onclick = redirect;

const osCheck = document.getElementById("opsys");

// OS check ==================================
function opCheck() {
  navigator.userAgentData
    .getHighEntropyValues(["platformVersion"])
    .then((ua) => {
      const platformVersion = ua.platformVersion.split(".").map(Number); // Parse the version string to an array of numbers
      if (navigator.userAgentData.platform === "Windows") {
        if (platformVersion[0] >= 13) {
          osCheck.textContent = "Windows 11";
          osReq.src = "/assets/loaded.svg";
        } else if (platformVersion[0] > 0) {
          osCheck.textContent = "Windows 10";
          osReq.src = "/assets/loaded.svg";
        } else {
          const windowsVersions = [
            "Windows 8.1",
            "Windows 8",
            "Windows 7",
            "Windows Vista",
            "Windows XP",
            "Windows 2000",
          ];
          let index = 0;
          if (platformVersion[1] === 0 && platformVersion[2] === 0) {
            index = 3; // Windows Vista
            osReq.src = "/assets/cross_mark.svg";
          } else if (platformVersion[1] === 1) {
            index = 4; // Windows XP
            osReq.src = "/assets/cross_mark.svg";
          } else if (platformVersion[1] === 2) {
            index = 0; // Windows 8.1
            osReq.src = "/assets/loaded.svg";
          } else if (platformVersion[1] === 3) {
            index = 1; // Windows 8
            osReq.src = "/assets/loaded.svg";
          } else if (platformVersion[1] === 4) {
            index = 2; // Windows 7
            osReq.src = "/assets/cross_mark.svg";
          }
          osCheck.textContent = windowsVersions[index];
        }
      } else {
        if (platformVersion[0] === 20) {
          osCheck.textContent = "MacOS";
          osReq.src = "/assets/loaded.svg";
        } else if (platformVersion[0] === 18) {
          osCheck.textContent = "Linux";
        } else if (
          platformVersion[0] === 11 ||
          platformVersion[0] === 10 ||
          platformVersion[0] === 9 ||
          platformVersion[0] === 8 ||
          platformVersion[0] === 7 ||
          platformVersion[0] === 6 ||
          platformVersion[0] === 5 ||
          platformVersion[0] === 4 ||
          platformVersion[0] === 3 ||
          platformVersion[0] === 2
        ) {
          osCheck.textContent = "UNIX";
          osReq.src = "/assets/loaded.svg";
        } else {
          osCheck.textContent = "Unknown/Not-supported";
          osReq.src = "/assets/cross_mark.svg";
        }
      }
    });
}

setTimeout(() => {
  opCheck();
}, 2000)

clearTimeout();