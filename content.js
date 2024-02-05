let key = "Key-5058";
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
  if (e.ctrlKey) {
    console.log("Content blocked due to ctrl keys");
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

chrome.runtime.sendMessage("app-data", (response) => {
  console.log("working", response);
});

chrome.runtime.sendMessage("examStarted", (response) => {
  console.log("working", response);
});

// External message response
// request == "uninstall";
// request == "closedTab";
// request == "examCompleted";
// request == "examStarted";
// request == "blockExtension";
// request.key == "checkInstallation";
// request.key == "installExtension";

// chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
//     console.log("Received external message:", request, sender);
//     try {
//         if (request.key == 'installExtension') {
//             const manifest = chrome.runtime.getManifest();
//             console.log('Installing');
//             return sendResponse({
//                 type: 'success',
//                 version: manifest.version,
//                 installed: true
//             });
//         } else if (request === "closedTab") {
//             console.log('External App message is working');

//             // Send a response back to the sender (parent app)
//             sendResponse({
//                 type: 'success',
//                 message: 'Received closedTab message'
//             });
//         }
//     } catch (error) {
//         console.error('Error handling external message:', error);
//     }
// });
