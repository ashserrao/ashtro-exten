

let cId = 196;
let clientUrls = ["chrome://","examroom.ai"];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'api-data') {
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
                    const allowedUrls = clientData.allowedurls;
                    clientUrls = allowedUrls;
                    sendResponse(allowedUrls);
                } else {
                    sendResponse({ error: 'Client not found' });
                }
            })
            .catch(error => {
                console.error('Error fetching allowedurls:', error);
                sendResponse({ error: 'Error fetching allowedurls' });
            });
        return true;
    }
});


chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ currentWindow: true}, function(allTabs) {
        const allowedUrls = [
            "chrome://",
            "examroom.ai",
        ];
        
        allTabs.forEach(function(tab) {
            const tabUrl = tab.url;
            let isMatched = clientUrls.some(allowedUrl => tabUrl.includes(allowedUrl));
            if(!isMatched){
                chrome.tabs.remove(tab.id);
            }
        })
    })
});

chrome.tabs.onUpdated.addListener(() => {
    chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        allTabs.forEach(function (tab) {
            const tabUrl = tab.url;
            let isMatched = clientUrls.some(allowedUrl => tabUrl.includes(allowedUrl));
            if (!isMatched) {
                chrome.tabs.remove(tab.id);
            }
        });
    });
});


// chrome.runtime.onInstalled.addListener(() => {
//     let allData = [];
//     // let clientUrls = [];
//     chrome.tabs.query({ currentWindow: true}, function(allTabs) {
//         fetch('https://examroom.ai/candidate/assets/script/allowedurl1.json')
//         .then((data) => {
//             if(!response.ok){
//                 throw new Error('Network response failed');
//             }
//                 data.json();
//         })
//         .then((apiData) => {
//             console.log(apiData)
//         })
//         .catch(error => {
//             console.error('Error fetching data:', error);
//         })
//     })        
// });


// Content blocking ---------------------------------------------------------------------------
// const body = document.querySelector('body');

// chrome.runtime.onInstalled.addListener((e) => {
//     if(e.ctrlKey){
//         body.style.opacity = '1';
//     } else {
//         body.style.opacity = '0';
//     }
// });

// document.addEventListener('keyup', function(e) {
//     if(e.ctrlKey){
//         document.querySelector('body').style.opacity = '1';
//     } else {
//         document.querySelector('body').style.opacity = '0';
//     }
// })


// Create new tab on Install ---------------------------------------------------------------------------
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.tabs.create({
//         url: 'https://www.examroom.ai/'
//     });
// });


// // close all tabs except active tab ------------------------------------------------------------------

// chrome.tabs.query({ active: true, currentWindow: true }, function(activeTabs) {
//     const currentTabId = activeTabs[0].id;

//     chrome.tabs.query({ currentWindow: true }, function(allTabs) {
//         allTabs.forEach(function(tab) {
//             if (tab.id !== currentTabId) {
//                 chrome.tabs.remove(tab.id);
//             }
//         });
//     });
// });


// getData(); // will be logged in service worker

// chrome.runtime.onUpdate

// chrome.runtime.onActivate


// client id

// fetch clientid

    