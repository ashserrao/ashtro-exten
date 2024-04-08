const backgroundPort = chrome.runtime.connect({ name: "devtools" });

backgroundPort.postMessage({ name: "openDevTools" });

// backgroundPort.onDisconnect.addListener(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     const currentTab = tabs[0];
//     chrome.tabs.remove(currentTab.id);
//   });
// });
//
//
//
//
//   "chrome_url_overrides": {
//     "newtab": "newtab.html"
//   },
