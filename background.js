let cId = 196;
let clientUrls = ["chrome://","examroom.ai"];


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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message === 'app-data'){
        fetch('https://examroom.ai/candidate/assets/script/allowedurl1.json')
        .then(response => {
            if(!response.ok){
                throw new Error('Data failed from network side')
            }
            return response.json();
        })
        .then( data => {
            const clientData = data.key.find(element => element.clientId === cId);
            if(clientData){
                const allowedUrls = clientData.allowedurls;
                console.log('data-success');
                clientUrls = allowedUrls;
                sendResponse(allowedUrls);
            } else {
                sendResponse('client urls not found')
            }
        })
        .catch(error => {
            console.error('error fetching data', error)
        })
        return true
    }
});

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


chrome.runtime.onConnect.addListener(port => {
    if (port.name === "devtools") {
      port.onMessage.addListener(msg => {
        if (msg.name === "openDevTools") {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const currentTab = tabs[0];
                chrome.tabs.remove(currentTab.id);
            });
        }
      });
    }
  });  

