// let request = "exam-started";
// let can_id = 12345;
// let ex_id = 123;
// let cli_id = 196;

//api data variable =================

let request;
let can_id;
let ex_id;
let cli_id;
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
            sendCandidateDetails(systemIP);
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
  if (message === "getCandidateData") {
    fetch("http://localhost:3000/candidate")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response error");
        }
        return response.json();
      })
      .then((data) => {
        // cli_id = parseInt(data[0].client_id);
        cli_id = data[0].client_id;
        request = data[0].request;
        can_id = data[0].candidate_id;
        ex_id = data[0].exam_id;
        sendResponse({ message: "working", cli_id });
        onRequest();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

// getting client irls ==============================================
function getExamUrls() {
  return fetch("https://examroom.ai/candidate/assets/script/allowedurl1.json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network data error");
      }
    })
    .then((data) => {
      console.log("Data from URL:", data);
      const ClientData = data.key.find(
        (element) => element.clientId === cli_id
      );
      if (ClientData) {
        clientUrls = ClientData.allowedurls;
        console.log(clientUrls);
        return clientUrls;
      } else {
        throw new Error("Error in client data");
      }
    });
}

// on extension installation gets the allowed urls api data =============================
async function onRequest() {
  // when status is exam-started ====================================
  if (request === "exam-started") {
    getExamUrls();
    // when status is uninstall ====================================
  } else if (request === "uninstall") {
    chrome.management.uninstall(chrome.runtime.id);
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
    } catch {
      (error) => {
        console.log("error during exam completion", error);
      };
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
    } catch {
      (error) => {
        console.log("error during exam completion", error);
      };
    }
  } else {
    console.log("error in exam status");
  }
}

// Gesture logging trigger========================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data === "AI") {
    sendResponse("saveGestureLogs working");
    saveGestureLogs(message);
  }
});

// Gesture logging functions ==============================
function saveGestureLogs(message) {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  try {
    const serveMessage = {
      candidate_id: JSON.stringify(can_id),
      exam_id: JSON.stringify(ex_id),
      client_id: JSON.stringify(cli_id),
      msg: message.msg,
      timestamp: today.toUTCString(),
    };
    postData("http://localhost:3000/Gesturelogs", serveMessage);
  } catch (error) {
    console.log("saveGestureLogs error", error);
  }
}

// Candidate data logging function ==============================
function sendCandidateDetails(data) {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  try {
    const serveMessage = {
      by: "chrome",
      candidate_id: JSON.stringify(can_id),
      exam_id: JSON.stringify(ex_id),
      client_id: JSON.stringify(cli_id),
      ip: data,
      url: data.url,
      remarks: "Dev tools opened by candidate",
      timestamp: today.toUTCString(),
    };
    postData("http://localhost:3000/Devlogs", serveMessage);
  } catch (error) {
    console.log("saveGestureLogs error", error);
  }
}

// post Data function ========================================
function postData(url, data) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("postData response:", data);
    })
    .catch((error) => {
      console.error("Error during postData:", error);
    });
}
