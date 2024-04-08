//Redirect to profile page ========================
const profileIconButton = document.getElementById("profile");

profileIconButton.onclick = function () {
  window.location = "profile.html";
};

//Clicking on anywhere on the document calling function redirect============
const cardClick = document.getElementById("clickcard");

cardClick.onclick = redirect;

const cookieReq = document.getElementById("cookie-req");
const ssReq = document.getElementById("ss-req");

//redirect function=====================
function redirect() {
  window.location = "./netConfig.html";
}

function checkCookies() {
  if (navigator.cookieEnabled == true) {
    cookieReq.src = "/assets/loaded.svg";
  } else {
    cookieReq.src = "/assets/cross_mark.svg";
  }
}

function screenShare() {
  if (
    navigator.mediaDevices &&
    "getDisplayMedia" in navigator.mediaDevices == true
  ) {
    ssReq.src = "/assets/loaded.svg";
  } else {
    ssReq.src = "/assets/cross_mark.svg";
  }
}

window.onload = function () {
  setInterval(() => {
    checkCookies();
    screenShare();
  }, 2000);

  clearInterval();
};
