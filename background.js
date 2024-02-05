let cId = 196;
let clientUrls = [
  "chrome://",
  "examroom.ai",
  "file:///D:/project/Strike-pack/basic/index.html",
];
let LocalID;

// on extension installation closes all tabs and leaves a exai tab open ----------
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({
    url: "https://www.examroom.ai",
  }),
    chrome.tabs.query({ currentWindow: true }, function (allTabs) {
      allTabs.forEach(function (tab) {
        const tabUrl = tab.url;
        let isMatched = clientUrls.some((allowedurl) =>
          tabUrl.includes(allowedurl)
        );
        if (!isMatched) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
});

// on extension installation gets the allowed urls api data ---------- problem with
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "app-data") {
    fetch("https://examroom.ai/candidate/assets/script/allowedurl1.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(async (data) => {
        const clientData = data.key.find((element) => element.clientId === cId);
        if (clientData) {
          const alloweditems = clientData.allowedurls;
          clientUrls = alloweditems;
          // Store candidate Id in local storage =======================================
          await chrome.storage.local.set({ cId: cId });
          getCandidateData(); // Dummy to get candidate details =======================================
          sendResponse({ success: true, data: alloweditems });
        } else {
          sendResponse({ success: false, error: "Client data not found" });
        }
      })
      .catch((error) => {
        console.error("Error fetching or parsing data:", error);
        sendResponse({
          success: false,
          error: "Failed to fetch or parse data",
        });
      });

    // Indicate that this message handler will respond asynchronously
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "examStarted") {
    console.log("Exam started");
    sendResponse("Exam started message received");
  }
});

// when candidate opens new tab checks if it is in allowed urls and takes actions accordingly ----------
chrome.tabs.onUpdated.addListener(() => {
  chrome.tabs.query({ currentWindow: true }, function (allTabs) {
    allTabs.forEach(function (tab) {
      const tabUrl = tab.url;
      let isMatched = clientUrls.some((allowedurl) =>
        tabUrl.includes(allowedurl)
      );
      if (!isMatched) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools") {
    port.onMessage.addListener((msg) => {
      if (msg.name === "openDevTools") {
        // Iplogging of the system =======================
        fetch("https://api64.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => {
            const systemIP = data.ip;
            console.log("Current System IP:", systemIP);
            //   Close the tab with dev tools ==========================
            //   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            //     const currentTab = tabs[0];
            //     chrome.tabs.remove(currentTab.id);
            //   });
          })
          .catch((error) => {
            console.error("Error fetching IP address:", error);
          });
      }
    });
  }
});

// dummy api get candidate details
function getCandidateData() {
  fetch("https://jsonplaceholder.typicode.com/users")
    .then((response) => response.json()) // Return the parsed JSON data
    .then((data) => {
      const userData = data.find((user) => user.id === 2);
      if (userData) {
        const userName = userData.username;
        console.log(userName);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
//     console.log("Received message:", request, sender);
//     try {
//         if (request.key === "installExtension") {
//             console.log('Installing extension for clientId:', request.clientId);
//             // Send a response back to the parent app
//             sendResponse({
//                 type: 'success',
//                 message: 'Extension installed successfully'
//             });
//         } else if (request === "closedTab") {
//             console.log('External App message is working');

//             // Send a response back to the parent app
//             sendResponse({
//                 type: 'success',
//                 message: 'Received closedTab message'
//             });
//         }
//     } catch (error) {
//         console.error('Error handling external message:', error);
//     }
// });
