//api data variables ============================
let request, can_id, ex_id, cli_id;
let clientUrls = ["chrome://", "edge://", "examroom.ai"];
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
      }
    });
  }
});

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

// CPU and RAM Load trigger ===============================
setInterval(function () {
  SysStat();
  elementChrome();
}, 5000);

//Number of processor in the system==================
console.log(
  `Number of processor in the system ${navigator.hardwareConcurrency}`
);
//System CPU and RAM processing monitoring ==========================
//usage : {idle: 228072500000, kernel: 10593906250, total: 244910312500, user: 6243906250}
var previousCPU = null;
var ram_usage = 75;
var ram_balance = 100 - ram_usage;
var ram_capacity;

function SysStat() {
  //CPU Load ==========================
  chrome.system.cpu.getInfo(function (info) {
    var usedPers = 0;

    for (var i = 0; i < info.numOfProcessors; i++) {
      var usage = info.processors[i].usage;
      if (previousCPU !== null) {
        var oldUsage = previousCPU.processors[i].usage;
        usedInPercentage = Math.floor(
          ((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) /
            (usage.total - oldUsage.total)) *
            100
        );
      } else {
        usedInPercentage = Math.floor(
          ((usage.kernel + usage.user) / usage.total) * 100
        );
      }
      usedPers += usedInPercentage;
      // console.log(`Processor ${i + 1}: ${usedInPercentage}%`);
    }
    usedPers = Math.round(usedPers / info.numOfProcessors);
    previousCPU = info;
    console.log(`CPU Model ${info.modelName}`);
    console.log(`CPU Load: ${usedPers}%`);
  });

  // RAM Load ================================

  chrome.system.memory.getInfo(function (info) {
    ram_usage =
      100 - Math.round((info.availableCapacity / info.capacity) * 100);
    ram_capacity = parseInt(info.capacity / 1000000000);
    console.log(`RAM capacity ${ram_capacity}`);
    console.log(`RAM usage ${ram_usage}%`);
  });
}

//
//
//
//
//
//
//
//
//
//
// chrome tabs ====================================
function elementChrome() {
  //chrome version =======================
  console.log(
    `chrome version: ${/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]}`
  );
  //Network status ==============================
  if (navigator.onLine) {
    console.log("Connected/" + navigator.connection.effectiveType);
  } else {
    console.log("Not Connected");
  }
  // chrome all window tabs ==============================
  chrome.windows.getAll({ populate: true }, function (windowList) {
    var totTabs = 0;
    // console.log(`Tabs open in current window: ${windowList.length}`);
    for (var i = 0; i < windowList.length; i++) {
      totTabs = totTabs + windowList[i].tabs.length;
    }
    console.log(`Total number of tabs open: ${totTabs}`);
  });
}
