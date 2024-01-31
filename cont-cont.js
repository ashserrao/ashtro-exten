const body = document.querySelector('body');
let spaceCount = 0;

const blockContent = () => {
    body.style.opacity = '0';
}

const unBlockContent = () => {
    body.style.opacity = '1';
}


// 1. Send a message to the background script or content script requesting the user's data
chrome.runtime.sendMessage('api-data', (response) => {
    console.log('Received API data:', response);
});


document.addEventListener('keydown', function (e) {
    if (e.ctrlKey) {
        console.log("KeyStroke", e);
        blockContent();
    } else if(e.key === " ") {
        spaceCount++;
        if(spaceCount === 2){
            unBlockContent();
            spaceCount = 0;
        }
    } else {
        console.log('OnKey down failed', e);
    }
});