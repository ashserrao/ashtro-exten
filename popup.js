fetch('https://icanhazdadjoke.com/slack')
    .then(data => data.json())
    .then( APIdata => {
        const APItext = APIdata.attachments[0].text;
        const jElement = document.getElementById('mainElement');
        jElement.innerHTML = APItext;
    })

document.addEventListener('keyup', function(e) {
    if(e.ctrlKey){
        document.querySelector('body').style.opacity = "1";
    } else {
        document.querySelector('body').style.opacity = "0";
    }
})