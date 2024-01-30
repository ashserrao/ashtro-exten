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



// chrome.runtime.onInstalled.addListener(() => {
//     chrome.tabs.create({
//         url: 'https://www.examroom.ai/'
//     });
//     getData();
// });

// // close all tabs except active tab -----------------

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

// function getData(){
//     fetch('https://examroom.ai/candidate/assets/script/allowedurl1.json')
//     .then((data) => data.json())
//     .then((APIdata) => {
//         console.log(APIdata);
//     })
// }





// close all tabs except examroom.ai tabs ------------------

// chrome.runtime.onInstalled.addListener(function(details) {
//     if (details.reason === 'install') {
//         // Close all tabs except those in www.examroom.ai domain
//         chrome.tabs.query({}, function(allTabs) {
//             allTabs.forEach(function(tab) {
//                 const tabUrl = new URL(tab.url);
//                 if (tabUrl.hostname !== 'www.examroom.ai') {
//                     chrome.tabs.remove(tab.id);
//                 }
//             });
//         });
//     }
// });


chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
        url: 'https://www.examroom.ai/'
    }, function(newTab) {
        // Callback function for chrome.tabs.create()
        getData();
        
        // close all tabs except active tab -----------------
        chrome.tabs.query({ active: true, currentWindow: true }, function(activeTabs) {
            const currentTabId = activeTabs[0].id;

            chrome.tabs.query({ currentWindow: true }, function(allTabs) {
                allTabs.forEach(function(tab) {
                    if (tab.id !== currentTabId) {
                        chrome.tabs.remove(tab.id);
                    }
                });
            });
        });
    });
});

function getData(){
    fetch('https://examroom.ai/candidate/assets/script/allowedurl1.json')
    .then((data) => data.json())
    .then((APIdata) => {
        console.log(APIdata);
    })
}
