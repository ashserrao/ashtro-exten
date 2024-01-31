let spaceCount = 0; 
const body = document.querySelector('body');

// block content function ----------------------
const blockContent = () => {
    body.style.opacity = '0';
}

// unblock content function ----------------------

const unBlockContent = () => {
    body.style.opacity = '1';
}

// keydown event listener --------------------------
document.addEventListener('keydown', function (e) {
    if(e.ctrlKey){
        console.log('Content blocked due to ctrl keys');
        blockContent();
    } else if(e.key === " ") {
        spaceCount++;
        if(spaceCount === 2){
            // console.log(spaceCount);
            unBlockContent();
            spaceCount = 0;
        }
    } else {
        console.log("Keydown event failed", e);
    }
})

chrome.runtime.sendMessage('app-data', response => {
    console.log(response);
})
