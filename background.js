let cId = 196;
let clientUrls = ["chrome://","examroom.ai"];


// on extension installation closes all tabs and leaves a exai tab open ----------
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
        url:'https://www.examroom.ai'
    }),
    chrome.tabs.query({currentWindow: true}, function(allTabs) {
        allTabs.forEach(function(tab) {
            const tabUrl = tab.url;
            let isMatched = clientUrls.some(allowedurl => tabUrl.includes(allowedurl));
            if(!isMatched){
                chrome.tabs.remove(tab.id);
            }
        })
    })
});

// on extension installation gets the allowed urls api data ---------- problem with 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'app-data') {
        fetch('https://examroom.ai/candidate/assets/script/allowedurl1.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const clientData = data.key.find(element => element.clientId === cId);
                if (clientData) {
                    const alloweditems = clientData.allowedurls;
                    clientUrls = alloweditems;
                    sendResponse({ success: true, data: alloweditems });
                } else {
                    sendResponse({ success: false, error: 'Client data not found' });
                }
            })
            .catch(error => {
                console.error('Error fetching or parsing data:', error);
                sendResponse({ success: false, error: 'Failed to fetch or parse data' });
            });

        // Indicate that this message handler will respond asynchronously
        return true;
    }
});


// when candidate opens new tab checks if it is in allowed urls and takes actions accordingly ----------
chrome.tabs.onUpdated.addListener(() => {
    chrome.tabs.query({currentWindow: true}, function(allTabs) {
        allTabs.forEach(function(tab) {
            const tabUrl = tab.url;
            let isMatched = clientUrls.some(allowedurl => tabUrl.includes(allowedurl));
            if(!isMatched){
                chrome.tabs.remove(tab.id);
            }
        });
    });
});

// when candidate opens dev tools auto closes the current tab  ----------
chrome.runtime.onConnect.addListener(port => {
    if (port.name === "devtools") {
      port.onMessage.addListener(msg => {
        if (msg.name === "openDevTools") {
            // chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            //     const currentTab = tabs[0];
            //     chrome.tabs.remove(currentTab.id);
            // });
        }
      });
    }
  });