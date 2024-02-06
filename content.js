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
    console.log(
      `Content blocked since the candidate pressed alt key and ${e.key}`
    );
    blockContent();
  } else if (e.ctrlKey && e.shiftKey) {
    console.log(
      `Content blocked since the candidate pressed ctrl and ${e.key}`
    );
    blockContent();
  } else if (e.shiftKey && e.metaKey) {
    console.log(
      `Content blocked since the candidate pressed shift and ${e.metaKey}`
    );
    blockContent();
  } else if (e.ctrlKey && e.shiftKey && "34".indexOf(e.key)) {
    console.log(`Pressed ctrl key, shift key and ${e.key} key`);
    blockContent();
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
    console.log(
      `Content blocked since the candidate pressed ${e.key} which is not allowed.`
    );
    blockContent();
  } else if (e.ctrlKey && "cvxspwuaz".indexOf(e.key) !== -1) {
    console.log(
      `Content blocked since the candidate pressed ctrl key and ${e.key}`
    );
    blockContent();
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

chrome.runtime.sendMessage("getCandidateData", (response) => {
  setTimeout(() => {
    console.log("working", response);
  }, 2000);
});

chrome.runtime.sendMessage("exam-status", (response) => {
  console.log("Event triggered", response);
});

// External message response
// request == "uninstall";
// request == "closedTab";
// request == "examCompleted";
// request == "examStarted";
// request == "blockExtension";
// request.key == "checkInstallation";
// request.key == "installExtension";
