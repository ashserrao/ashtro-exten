
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
        url:'https://www.examroom.ai'
    }),
    chrome.tabs.query({ active:true, currentWindow:true}, function(activeTab) {
        const currentTabId = activeTab[0].id;

        chrome.tabs.query({ currentWindow:true}, function(allTabs) {
            allTabs.forEach(function(tab) {
                if(tab.id !== currentTabId){
                    chrome.tabs.remove(tab.id);
                }
            });
        })
    })
});