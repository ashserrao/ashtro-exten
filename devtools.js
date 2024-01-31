const backgroundPort = chrome.runtime.connect({ name: "devtools" });

// Close the tab when DevTools are opened
backgroundPort.postMessage({ name: "openDevTools" });

backgroundPort.onDisconnect.addListener(() => {
  // DevTools closed, you can add more cleanup logic here if needed
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentTab = tabs[0];
    chrome.tabs.remove(currentTab.id);
  });
});
