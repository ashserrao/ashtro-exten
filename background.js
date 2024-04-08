console.log("background.js is working");

//api data variables ============================
let request, can_id, ex_id, cli_id;
let clientUrls = ["chrome://", "chrome-extension://", "edge://", "examroom.ai"];
let isRunningExam = false;

// on extension installation ======================
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: "https://www.examroom.ai" });
  chrome.tabs.query({ currentWindow: true }, (allTabs) => {
    allTabs.forEach((tab) => {
      const tabUrl = tab.url;
      if (!clientUrls.some((allowedurl) => tabUrl.includes(allowedurl))) {
        chrome.tabs.remove(tab.id);
      } else {
        chrome.tabs.reload(tab.id);
      }
    });
  });
});

// when candidate opens new tab ===================
chrome.tabs.onUpdated.addListener(() => {
  if (isRunningExam) {
    chrome.tabs.query({ currentWindow: true }, (allTabs) => {
      allTabs.forEach((tab) => {
        if (!clientUrls.some((allowedurl) => tab.url.includes(allowedurl))) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  } else {
    console.log("Exam is not running");
  }
});

// Function on opening dev tools ===================
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools") {
    port.onMessage.addListener((msg) => {
      if (msg.name === "openDevTools") {
        fetchSystemIP();
        onDevToolsOpen();
      }
    });
  }
});

function onDevToolsOpen() {
  chrome.tabs.query({ currentWindow: true }, (allTabs) => {
    chrome.tabs.create({ url: "https://examroom.ai/34pizy6/" });
    allTabs.forEach((tab) => {
      const tabUrl = tab.url;
      if (tabUrl === "https://examroom.ai/34pizy6/") {
        console.log("you tried to hack us page");
      } else {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

// Fetch system IP =================================
function fetchSystemIP() {
  fetch("https://api64.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      const systemIP = data.ip;
      console.log("Current System IP:", systemIP);
      sendCandidateDetails(systemIP);
    })
    .catch((error) => {
      console.error("Error fetching IP address:", error);
    });
}

// Fetch candidate data ============================
function fetchCandidateData() {
  fetch("http://localhost:3000/candidate")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response error");
      }
      return response.json();
    })
    .then((data) => {
      ({
        client_id: cli_id,
        request,
        candidate_id: can_id,
        exam_id: ex_id,
      } = data[0]);
      onRequest();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      chrome.runtime.sendMessage({ error: error.message });
    });
}

// Run request every 5 seconds ====================
// setInterval(fetchCandidateData, 5000);

// setInterval(installChecker, 30000);

// Listen for getCandidateData message ==============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCandidateData") {
    fetchCandidateData();
    return true;
  }
});

// Getting client urls ==============================
async function getExamUrls() {
  try {
    const response = await fetch(
      "https://examroom.ai/candidate/assets/script/allowedurl1.json"
    );
    if (!response.ok) throw new Error("Network data error");
    const data = await response.json();
    const clientData = data.key.find((element) => element.clientId === cli_id);
    if (clientData) {
      clientUrls = clientData.allowedurls;
    } else {
      throw new Error("Error in client data");
    }
  } catch (error) {
    console.error("Error fetching client URLs:", error);
  }
}

// Functions on request =============================
function onRequest() {
  switch (request) {
    case "exam-started":
      isRunningExam = true;
      console.log(isRunningExam);
      getExamUrls();
      break;
    case "uninstall":
      chrome.management.uninstall(chrome.runtime.id);
      break;
    case "closedTab":
      closeTabs();
      isRunningExam = false;
      break;
    case "exam-completed":
      // chrome.management.uninstall(chrome.runtime.id);
      closeTabs();
      isRunningExam = false;
      console.log(isRunningExam);
      break;
    case "block-extension":
      isRunningExam = false;
      cli_id = undefined;
      request = undefined;
      can_id = undefined;
      ex_id = undefined;
      break;
    default:
      console.log("Request not found:", request);
  }
}

// Close tabs =====================================
function closeTabs() {
  try {
    chrome.tabs.query({ active: false, currentWindow: true }, (allTabs) => {
      allTabs.forEach((tab) => {
        chrome.tabs.remove(tab.id);
      });
    });
  } catch (error) {
    console.error("Error closing tabs:", error);
  }
}

// Gesture logging trigger =========================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data === "AI") {
    sendResponse("saveGestureLogs working");
    saveGestureLogs(message);
  }
});

// Gesture logging ================================
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
    if (serveMessage.candidate_id) {
      postData("http://localhost:3000/Gesturelogs", serveMessage);
    } else {
      console.log("No candidate details");
    }
  } catch (error) {
    console.error("Error saving gesture logs:", error);
  }
}

//Install checker ==========
function installChecker(data) {
  try {
    if (can_id) {
      const payload = {
        candidate: can_id,
        status: data,
      };
      postData("http://localhost:3000/installChecker", payload);

      // window["chrome"].runtime.sendMessage(
      //   "extension-installation-message",
      //   (response) => {
      //     console.log(response);
      //   }
      // );
    } else {
      console.log("Candidate details not found in data");
    }
  } catch (err) {
    console.error("Error in install checker:", err);
  }
}

// Candidate data logging ===========================
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
    console.error("Error sending candidate details:", error);
  }
}

// Post data =======================================
function postData(url, data) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Post data response:", data);
    })
    .catch((error) => {
      console.error("Error posting data:", error);
    });
}

//AddFlags=== https://erv2developmentapi.examroom.ai/ProctorBFF/api/Flags/AddFlags?tenantGuid=FFD83A47-B597-4FFB-A359-4A3A544DCDE4&userGuid=DE4FDB3B-21F4-425B-AC27-C5EFED044DF1&examPersonEventGuid=3fa85f64-5717-4562-b3fc-2c963f66afa