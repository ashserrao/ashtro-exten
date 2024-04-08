//Redirect to profile page ========================
const profileIconButton = document.getElementById("profile");

profileIconButton.onclick = function () {
  window.location = "profile.html";
};

//Clicking on anywhere on the document calling function redirect============
const cardClick = document.getElementById("clickcard");

cardClick.onclick = redirect;

//redirect function=====================
function redirect() {
  window.location = "./browConfig.html";
}

const osCheck = document.getElementById("os-check");
const browserVersion = document.getElementById("browser-check");
const network = document.getElementById("net-stat");

const osReq = document.getElementById("os-req");
const browReq = document.getElementById("brow-req");
const netReq = document.getElementById("net-req");

function opCheck() {
  // OS name ==================================
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

function browserCheck() {
  var result = bowser.getParser(window.navigator.userAgent);
  browserVersion.innerText = `${result.parsedResult.browser.name}/${result.parsedResult.browser.version}`;
  if (
    result.parsedResult.browser.name === "Chrome" &&
    result.parsedResult.browser.version < 73
  ) {
    browReq.src = "/assets/cross_mark.svg";
  } else if (
    result.parsedResult.browser.name === "Microsoft Edge" &&
    result.parsedResult.browser.version < 89
  ) {
    browReq.src = "/assets/cross_mark.svg";
  } else {
    browReq.src = "/assets/loaded.svg";
  }
}

//Network status ==============================
function networkCheck() {
  if (navigator.onLine) {
    network.innerText = `Connected/${navigator.connection.effectiveType}`;
    netReq.src = "/assets/loaded.svg";
  } else {
    network.innerText = "Not Connected";
    netReq.src = "/assets/cross_mark.svg";
  }
}

setInterval(() => {
  opCheck();
  browserCheck();
  networkCheck();
}, 2000);

clearInterval();
