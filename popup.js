// "signals": [
//     {
//       "id": "EREX0101",
//       "request": "exam-started"
//     },
//     {
//       "id": "EREX0102",
//       "request": "uninstall"
//     },
//     {
//       "id": "EREX0103",
//       "request": "closedTab"
//     },
//     {
//       "id": "EREX0104",
//       "request": "exam-completed"
//     }
//   ],
//   "candidate": [
//     {
//       "candidate_id": 12039,
//       "exam_id": 1939,
//       "client_id": 196,
//       "request": "exam-started"
//     }
//   ]
//npx json-server db.json
// candidate generated from json server

function fetchData() {
  fetch("http://localhost:3000/candidate")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response error");
      }
      return response.json();
    })
    .then((data) => {
      const cli_id = data[0].client_id;
      const request = data[0].request;
      const can_id = data[0].candidate_id;
      const ex_id = data[0].exam_id;

      chrome.runtime.sendMessage({ message: "working", cli_id });
      onRequest();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      chrome.runtime.sendMessage({ error: error.message });
    });
}

// Run fetchData every 5 seconds
setInterval(fetchData, 5000); // 5000 milliseconds = 5 seconds

// Listen for getCandidateData message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCandidateData") {
    fetchData(); // Fetch data immediately when receiving the message
    return true; // Indicates to the sender that the message channel will be used asynchronously
  }
});
