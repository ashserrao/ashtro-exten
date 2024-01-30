const body = document.querySelector('body');
let uId = 12002;
let eId = 567;

const blockContent = () => {
      body.style.opacity = '0';
}

const unBlockContent = () => {
    body.style.opacity = '1';
}
  

body.onkeypress = function (e) {
    if(e.ctrlKey){
        console.log("keydown",e);
        blockContent();
    } else if (e.key === ' '){
        console.log("keydown",e);
        unBlockContent();
    } else {
        console.log('function spacebar misfire');
    }
}

console.log('we are up and running');


// const body = document.querySelector('body');

// chrome.runtime.onInstalled.addListener((e) => {
//     if(e.ctrlKey){
//         body.style.opacity = '1';
//     } else {
//         body.style.opacity = '0';
//     }
// });