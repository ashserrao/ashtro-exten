let requestId = "EREX0101";
let request;
let can_id = 12345;
let ex_id = 123;
let cli_id = 196;
let clientUrls = ["chrome://", "examroom.ai"];
let candidateData;
let isRunningExam = false;

// on extension installation closes all tabs and leaves a exai tab open ====================
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

// when candidate opens new tab checks if it is in allowed urls and takes actions accordingly ==============
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

// Function on opening dev tools ==========================================================
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "exam-status") {
    setTimeout(() => {
      fetch("http://localhost:3000/signals")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          let items = data.find((item) => item.id === requestId);
          if (items) {
            request = items.request;
            console.log(request);
            sendResponse(request);
          } else {
            console.log("No item found with specified ID.");
            sendResponse(null);
          }
          onRequest();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          sendResponse({ error: error.message });
        });
    }, 5000);
    // Ensure sendResponse is returned synchronously
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCandidateData") {
    fetch("http://localhost:3000/candidate")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network data response error");
        }
        return response.json();
      })
      .then((data) => {
        // Assuming data is an array and contains at least one element
        // cli_id = data[0].client_id;
        console.log(cli_id);
        console.log(data[0].client_id);

        sendResponse({ client_id: cli_id }); // Sending client_id back to the sender
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        sendResponse({ error: error.message });
      });

    return true; // Ensure sendResponse is returned synchronously
  }
});

// Functions section ===========================================================================================================================
//getting candidate details=========================================
function getCandidateData() {
  fetch("http://localhost:3000/candidate")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network data response error");
      }
      return response.json();
    })
    .then((data) => {
      candidateData = data;
      cli_id = data[0].client_id;
      console.log(cli_id);
      console.log(data[0].client_id);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // sendResponse({ error: error.message });
    });
}

// getting client irls ==============================================
function getExamUrls() {
  return new Promise((resolve, reject) => {
    fetch("https://examroom.ai/candidate/assets/script/allowedurl1.json")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          reject("network data error");
        }
      })
      .then((data) => {
        const ClientData = data.key.find(
          (element) => element.clientId === cli_id
        );
        if (ClientData) {
          clientUrls = ClientData.allowedurls;
          console.log(clientUrls);
          resolve(clientUrls);
        } else {
          reject("error in client data");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// on extension installation gets the allowed urls api data =============================
async function onRequest() {
  if (request === "exam-started") {
    getCandidateData();
    getExamUrls();
    // .then((data) => {
    //   sendResponse({
    //     success: true,
    //     data: data,
    //     message: "exam started run complete",
    //   });
    // })
    // .catch((error) => {
    //   sendResponse({ success: false, error: error });
    // });
  } else if (request === "uninstall") {
    chrome.management.uninstall(chrome.runtime.id);
    // return sendResponse({
    //   success: true,
    //   uninstalled: true,
    // });
    // when status is closed tab ====================================
  } else if (request === "closedTab") {
    try {
      chrome.tabs.query(
        { active: false, currentWindow: true },
        function (allTabs) {
          allTabs.forEach(function (tab) {
            const currentTab = tab.id;
            if (currentTab) {
              chrome.tabs.remove(tab.id);
            }
          });
        }
      );
      // chrome.management.uninstall(chrome.runtime.id);
      // sendResponse({ success: true, message: "Exam-completed run complete" });
    } catch {
      (error) => {
        console.log("error during exam completion", error);
      };
    }
    if (isRunningExam) {
      isRunningExam = false;
      candidateData = undefined;
      cli_id = undefined;
      await chrome.storage.session.clear();
    }
    // when status is exam-completed ====================================
  } else if (request == "exam-completed") {
    try {
      chrome.tabs.query(
        { active: false, currentWindow: true },
        function (allTabs) {
          allTabs.forEach(function (tab) {
            const currentTab = tab.id;
            if (currentTab) {
              chrome.tabs.remove(tab.id);
            }
          });
        }
      );
      // chrome.management.uninstall(chrome.runtime.id);
      // sendResponse({ success: true, message: "Exam-completed run complete" });
    } catch {
      (error) => {
        console.log("error during exam completion", error);
      };
    }
  } else {
    console.log("error in exam status");
    // sendResponse({ success: false, error: "Invalid message" });
  }
}

// // on extension installation gets the allowed urls api data =============================
// // 9 different requests ============================================
// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   // when status is start ====================================
//   if (message === "exam-started") {
//     getExamUrls()
//       .then((data) => {
//         sendResponse({
//           success: true,
//           data: data,
//           message: "exam started run complete",
//         });
//       })
//       .catch((error) => {
//         sendResponse({ success: false, error: error });
//       });
//   } else if (message === "uninstall") {
//     chrome.management.uninstall(chrome.runtime.id);
//     return sendResponse({
//       success: true,
//       uninstalled: true,
//     });
//     // when status is closed tab ====================================
//   } else if (message === "closedTab") {
//     try {
//       chrome.tabs.create((url = "https://www.examroom.ai"));
//       chrome.tabs.query({ currentWindow: true }, function (allTabs) {
//         allTabs.forEach(function (tab) {
//           const tabUrl = tab.id;
//           let isMatched = clientUrls.some((allowedurl) =>
//             tabUrl.includes(allowedurl)
//           );
//           if (isMatched) {
//             chrome.tabs.remove(tab.id);
//           }
//         });
//       });
//       sendResponse({ success: true, message: "Closed tab run complete" });
//     } catch {
//       sendResponse({ success: false, message: "error closing the tab" });
//     }
//     if (isRunningExam) {
//       isRunningExam = false;
//       candidateData = undefined;
//       cli_id = undefined;
//       await chrome.storage.session.clear();
//     }
//     // when status is exam ====================================
//   } else if (message === "exam-completed") {
//     try {
//       chrome.tabs.create((url = "https://www.examroom.ai"));
//       chrome.tabs.query(
//         { active: true, currentWindow: true },
//         function (allTabs) {
//           allTabs.forEach(function (tab) {
//             const currentTab = tab.id;
//             if (!currentTab) {
//               chrome.tabs.remove(tab.id);
//             }
//           });
//           chrome.management.uninstall(chrome.runtime.id);
//         }
//       );
//       sendResponse({ success: true, message: "Exam-completed run complete" });
//     } catch {
//       (error) => {
//         console.log("error during exam completion", error);
//       };
//     }
//   } else {
//     sendResponse({ success: false, error: "Invalid message" });
//   }
// });
