var UpTime = 0;
let tooltipTimeout = null;

function getId(item) {
    return document.getElementById(item);
}
const micButton = getId("voiceInput")
const tooltipText = getId("tooltip-text")
adjustDivStyle(currentNavMode().value);
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var recognition = new SpeechRecognition();
const basicCommands = {
    "CHANNEL UP": "nav_up", "CHANNEL DOWN": "nav_down", "PREVIOUS": "last_ch",
    "VOLUME UP": "vol_up", "VOLUME DOWN": "vol_down", "MUTE": "mute", "OK": "ok", "BACK": "back"
}
const channelCommands = {
    "FLOWERS": 207, "ASIANET NEWS": 233, "MAZHAVIL MANORAMA": 856,
    "KAIRALI TV": 214, "KAIRALI WE": 215, "SAFARI": 247, "AMRITA TV": 217,
    "JAI HIND": 220, "DD MALAYALAM": 218, "TWENTY FOUR": 239, "KAIRALI NEWS": 236,
    "MANORAMA NEWS": 235, "MATHRUBHUMI NEWS": 234, "REPORTER TV": 240
};

//const commands = basicCommands + channelCommands;
// if (SpeechGrammarList) {
//     var speechRecognitionList = new SpeechGrammarList();
//     var grammar = '#JSGF V1.0; grammar commands; public <commands> = ' + commands.join(' | ') + ' ;';
//     speechRecognitionList.addFromString(grammar, 1);
//     recognition.grammars = speechRecognitionList;
// }

function adjustDivStyle(selected) {
    let navButtons = document.getElementsByClassName('navigation-buttons')[0]
    if (selected == "tv") {
        navButtons.style.borderTopLeftRadius = "20px"
        navButtons.style.borderTopRightRadius = "100px"
    } else {
        navButtons.style.borderTopLeftRadius = "100px"
        navButtons.style.borderTopRightRadius = "20px"
    }
}
function generateChannelCards(channels) {
    const container = document.getElementById('channel-grid');
    channels.forEach((channel) => {
        const channelCard = document.createElement('div');
        channelCard.classList.add('channel-card');
        channelCard.setAttribute('onclick', `switchchannel(${channel.ch_num});`);

        const channelImage = document.createElement('img');
        channelImage.classList.add('channel-image');
        channelImage.setAttribute('src', channel.logoUrl);
        channelImage.setAttribute('alt', channel.name);

        channelCard.appendChild(channelImage);
        container.appendChild(channelCard);
    });
}
function currentNavMode() {
    return document.querySelector('input[name="navigation"]:checked');

}
function changeNav(selected) {
    adjustDivStyle(selected.value)
}
function sendNavigation(command) {
    let device = currentNavMode().value;
    (device == 'tv') ? sendTVCode(command) : sendDthCode(command);

}
const host = `http://${location.host}`;
function sendCommand(device, command) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `${host}/command?device=${device}&command=${command}`, true);
    xhr.send();
}
function sendTVCode(code) {
    let device = 'tv';
    sendCommand(device, code);
}
function sendDthCode(code) {
    stopScan();
    let device = 'dth';
    sendCommand(device, code);
}
function sendDthCustomCommand(key, value) {
    let device = 'dth';
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `${host}/command?device=${device}&${key}=${value}`, true);
    xhr.send();
}
function switchchannel(channel) {
    stopScan();
    let ch_num = channel.toString();
    sendDthCustomCommand('channel', ch_num);
}
function scanChannels(event) {
    let doscan = (event.checked) ? "true" : "false";
    sendDthCustomCommand('scan', doscan);
}
function stopScan() {
    let scanButton = document.getElementById('scan-btn');
    if (scanButton.checked) scanButton.checked = false;
}
function getCurrentTheme() {
    let mediaTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches) ? 'dark' : 'light';
    let manualTheme = document.documentElement.classList.value
    let currentTheme = document.documentElement.classList.value === "" ? mediaTheme : manualTheme;
    return currentTheme;
}
function setTheme(theme) {
    let button = document.querySelector('.theme-toggle-button');
    switch (theme) {
        case 'dark': {
            document.documentElement.classList.remove("light")
            document.documentElement.classList.add("dark")
            button.innerHTML = '<i class="fa fa-moon-o"></i>';
            localStorage.setItem("userTheme", "dark")
            break;
        }
        case 'light': {
            document.documentElement.classList.remove("dark")
            document.documentElement.classList.add("light")
            localStorage.setItem("userTheme", "light")
            button.innerHTML = '<i class="fa fa-sun-o"></i>';
            break;
        }
        default: {
            localStorage.setItem("userTheme", "default");
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.remove("light");
            button.innerHTML = '<i class="fa fa-adjust"></i>';
            break;
        }
    }
}

function toggleTheme() {
    // source: https://stackoverflow.com/a/68824350
    let currentChoice = localStorage.getItem("userTheme")
    let nextTheme = (currentChoice === "light") ? "dark" : (currentChoice === "dark") ? "default" : "light";
    setTheme(nextTheme);
}

function getMinutesFromNow(timeString) {
    const now = new Date();
    const [time, ampm] = timeString.split(" ");
    const [hour, minute] = time.split(/[:.]+/).map(Number);
    let hours = hour % 12;
    hours = (ampm == "PM") ? 12 + hours : hours;
    let totalMinutes = hours * 60 + minute;
    totalMinutes -= (now.getHours() * 60 + now.getMinutes());
    return totalMinutes;
}
function getRows() {
    return document.querySelectorAll(".table-price tr");
}

function removeUnwantedChannels() {
    const myChannels = ["MAZHAVIL MANORAMA", "KAIRALI TV", "KAIRALI WE TV", "AMRITA TV", "DD MALAYALAM"];
    var rows = getRows();
    for (i = 2; i < (rows.length); i++) {
        let channel = rows[i].getElementsByTagName("td")[1];
        let name = channel.innerHTML.toUpperCase();
        let removIt = myChannels.find(item => item === name);
        if (!removIt) {
            rows[i].parentNode.removeChild(rows[i]);
        }
    }
}
function removeOldItems() {
    var rows = getRows();
    for (i = 2; i < (rows.length); i++) {
        let margin = 2;//hours
        let time = rows[i].getElementsByTagName("td")[0];
        //remove style attribute of td[0]
        time.style = null;
        let minutesFromNow = getMinutesFromNow(time.innerHTML)
        if (minutesFromNow < -(margin * 60)) {
            //rows[i].parentNode.removeChild(rows[i]);
            rows[i].className = 'past-show'
        }
    }
}
function sortTable() {
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    while (switching) {
        switching = false;
        rows = getRows();
        for (i = 2; i < (rows.length - 2); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[0];
            y = rows[i + 1].getElementsByTagName("td")[0];
            if (getMinutesFromNow(x.innerHTML) > getMinutesFromNow(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
function highlightActiveShows() {
    const channelCodes = { "MAZHAVIL MANORAMA": 856, "KAIRALI TV": 214, "KAIRALI WE TV": 215, "AMRITA TV": 217, "DD MALAYALAM": 218 };
    var rows = getRows();
    for (let i = 2; i < rows.length - 2; i++) {
        let showtime = rows[i].getElementsByTagName("td")[0];
        let timetoshow = getMinutesFromNow(showtime.innerHTML);
        let channel = rows[i].getElementsByTagName("td")[1];
        let name = channel.innerHTML.toUpperCase();
        let margin = 15; //minutes
        let isPastShow = (rows[i].classList.contains('past-show'))
        if (!isPastShow && timetoshow < margin) {
            let code = channelCodes[name];
            channel.parentElement.onclick = function () { switchchannel(code); };
            channel.parentElement.className = "active-show";
        }
    }
}

function getEpg() {
    let epg = document.getElementById("epg");
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            epg_data = xhr.responseText;
        } else {
            epg_data = "";
        }
        epg.innerHTML = epg_data;
        removeUnwantedChannels();
        removeOldItems();
        sortTable();
        highlightActiveShows();
    }
    xhr.open('GET', `${host}/epg`, false);
    xhr.send(null);
}

function formatTime(seconds) {
    function pad(s) {
        return (s < 10) ? '0' + s : s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getUpTime() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        let uptime = 0;
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            uptime = xhr.responseText;
            UpTime = Math.ceil(parseInt(uptime) / 1000);
            setUpTime();
        }
    }
    xhr.open('GET', `${host}/uptime`, false);
    xhr.send(null);
}
function setUpTime() {
    document.getElementById("uptime").style.visibility = "visible";
    setInterval(updateUpTime, 1000);
    function updateUpTime() {
        UpTime++;
        let str_uptime = formatTime(UpTime);
        document.getElementById("uptime_string").innerText = str_uptime;
    }
}

function makeHorizontalTable() {
    var rows = document.querySelectorAll(".table-price tr");
    let n_of_h = rows[1].getElementsByTagName("td").length;
    var hTable = document.createElement("table");
    hTable.setAttribute("id", "horizontal-table");
    for (i = 0; i < n_of_h; i++) {
        let tr = document.createElement("tr");
        for (j = 1; j < rows.length - 1; j++) {
            let element = rows[j].getElementsByTagName("td")[i];
            let td = document.createElement("td");
            td.innerHTML = element.innerHTML;
            if (rows[j].hasAttribute("class")) {
                let originalElement = rows[j];
                td.onclick = originalElement.onclick;
                td.className = originalElement.className;
            }
            tr.appendChild(td);
        }
        hTable.appendChild(tr);
    }
    document.getElementById("epg-h").appendChild(hTable);
}
function switchTable() {
    if (window.innerWidth > window.innerHeight) {
        document.getElementById("epg-h").style.display = 'block';
        document.getElementById("epg").style.display = 'none';
    } else {
        document.getElementById("epg").style.display = 'block';
        document.getElementById("epg-h").style.display = 'none';
    }
    scrollToActiveShow()
}
function scrollToActiveShow() {
    if ($('#epg').is(':visible')) {
        let container = $('#epg');
        let activeShowRow = $('#epg .active-show:first');
        let offset = container.find('tr:nth-child(2)').height();
        container.scrollTop(activeShowRow.position().top - offset);
    } else {
        let container = $('#epg-h');
        let activeShowRow = $('#epg-h .active-show:first');
        let offset = container.find('td:nth-child(1)').width();
        let tdPadding = parseInt($('td').css('padding'));
        container.scrollLeft(activeShowRow.position().left - tdPadding - offset);
    }
}
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setTooltipText(text) {
    if (text == undefined) text = '';
    tooltipText.innerText = text;
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
    }
    await delay(2000);
    tooltipText.innerText = '';
}
function processVoiceCommand(command) {
    console.log("Processing :" + command);
    if (basicCommands.hasOwnProperty(command)) {
        let thisCommand = basicCommands[command];
        setTooltipText('sending ' + thisCommand);
        sendDthCode(thisCommand);
        return;
    } else {
        let chName = Object.keys(channelCommands).find(key => key.includes(command));
        if (chName) {
            let thisCommand = channelCommands[chName];
            switchchannel(thisCommand);
            chName = chName.replace(/(\w)(\w*)/g,
                function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
            setTooltipText('switching to ' + chName);
            return;
        } else {
            console.log(`No matching command found for "${command}"`);
        }
    }
    setTimeout(setTooltipText, 3000);
}
function prepareToListen() {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

recognition.onresult = function (event) {
    var command = event.results[0][0].transcript.toUpperCase();
    console.log(event)
    console.log(command + " " + event.results[0][0].confidence);
    setTooltipText(command);
    processVoiceCommand(command);
}

recognition.onspeechend = function () {
    recognition.stop();
    stopListening("speech end");
}

recognition.onnomatch = function () {
    stopListening("no match");
    setTooltipText('No match!');
}

recognition.onerror = function (event) {
    console.log(event.error)
    setTooltipText('Error!');
    stopListening("error occured");
}
micButton.onclick = function () {
    recognition.abort();
    micButton.classList.toggle('recording');
    if (micButton.classList.contains('recording')) {
        setTooltipText('Listening...');
    } else {
        setTooltipText('');
        setTimeout(setTooltipText, 3000);
    }
    setTimeout(function () { recognition.start(); }, 500);
    console.log('Ready to receive a command.');
}
function stopListening(reason) {
    console.log("stopping listning: " + reason);
    micButton.classList.remove('recording');
}
function setChannelCards() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            let data = xhr.responseText;
            data = JSON.parse(data);
            generateChannelCards(data.channels)
        }
    }
    xhr.open('GET', `${host}/channeldata`, false);
    xhr.send(null);
}

function loadSettings() {
    //prepare theme
    let preferedTheme = localStorage.getItem("userTheme")
    setTheme(preferedTheme)
}

$(document).on('click touchstart', function (e) {
    if (!$(e.target).closest('.epg').length != 0) {
        scrollToActiveShow();
    }
});

window.addEventListener('resize', function () {
    switchTable();
});
getUpTime();
setChannelCards();
loadSettings();

window.onload = function () {
    getEpg();
    makeHorizontalTable();
    switchTable();
    prepareToListen();
}
document.onvisibilitychange = function () {
    if (!document.hidden) {
        this.location.reload();
    }
}

