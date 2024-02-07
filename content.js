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
    console.log("Event-trigger", response);
  }, 2000);
});

// External message response
// request == "uninstall";
// request == "closedTab";
// request == "examCompleted";
// request == "examStarted";
// request == "blockExtension";
// request.key == "checkInstallation";
// request.key == "installExtension";

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

// disabled mouse right-click event function =============================
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
