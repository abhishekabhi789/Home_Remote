let tooltipTimeout = null;
var allChannels = [];

function getId(item) {
    return document.getElementById(item);
}
const micButton = getId("voiceInput")
const tooltipText = getId("tooltip-text")
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var recognition = new SpeechRecognition();
const basicCommands = {
    "CHANNEL UP": "nav_up", "CHANNEL DOWN": "nav_down", "PREVIOUS": "last_ch",
    "VOLUME UP": "vol_up", "VOLUME DOWN": "vol_down", "MUTE": "mute", "OK": "ok", "BACK": "back"
}

function adjustDivStyle(selected) {
    const navButtons = document.getElementsByClassName('navigation-buttons')[0]
    if (selected == "tv") {
        navButtons.style.borderTopLeftRadius = "20px"
        navButtons.style.borderTopRightRadius = "100px"
    } else {
        navButtons.style.borderTopLeftRadius = "100px"
        navButtons.style.borderTopRightRadius = "20px"
    }
}
function generateChannelCards(channels) {
    const container = getId('channel-grid');
    channels.forEach(({ name, ch_num, logo_url }) => {
        const channelCard = document.createElement('div');
        channelCard.classList.add('channel-card');
        channelCard.setAttribute('onclick', `switchchannel(${ch_num});`);

        const channelImage = document.createElement('img');
        channelImage.classList.add('channel-image');
        channelImage.setAttribute('src', logo_url);
        channelImage.setAttribute('alt', name);
        channelImage.setAttribute('title', name);

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
    const device = currentNavMode().value;
    (device == 'tv') ? sendTVCode(command) : sendDthCode(command);
}
function sendCommand(device, command) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/command?device=${device}&command=${command}`, true);
    xhr.send();
}
function sendTVCode(code) {
    const device = 'tv';
    sendCommand(device, code);
}
function sendDthCode(code) {
    stopScan();
    const device = 'dth';
    sendCommand(device, code);
}
function sendDthCustomCommand(key, value) {
    const device = 'dth';
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/command?device=${device}&${key}=${value}`, true);
    xhr.send();
}
function switchchannel(channel) {
    stopScan();
    const ch_num = channel.toString();
    sendDthCustomCommand('channel', ch_num);
}
function scanChannels(event) {
    const doscan = (event.checked) ? "true" : "false";
    sendDthCustomCommand('scan', doscan);
}
function stopScan() {
    const scanButton = getId('scan-btn');
    if (scanButton.checked) scanButton.checked = false;
}
function getCurrentTheme() {
    const mediaTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches) ? 'dark' : 'light';
    const manualTheme = document.documentElement.classList.value;
    const currentTheme = manualTheme === "" ? mediaTheme : manualTheme;
    return currentTheme;
}
function setTheme(theme) {
    const button = document.querySelector('.theme-toggle-button');
    switch (theme) {
        case 'dark': {
            document.documentElement.classList.remove("light");
            document.documentElement.classList.add("dark");
            button.innerHTML = '<i class="fa fa-moon-o"></i>';
            localStorage.setItem("userTheme", "dark");
            break;
        }
        case 'light': {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
            localStorage.setItem("userTheme", "light");
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
    const currentChoice = localStorage.getItem("userTheme")
    const nextTheme = (currentChoice === "light") ? "dark" : (currentChoice === "dark") ? "default" : "light";
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
function getRows(table) {
    return table.getElementsByTagName('tr');
}

function removeUnwantedChannels(data) {
    const myChannels = allChannels.movie_channels;
    data.filter(item => !myChannels.includes(item.channel.trim()))
        .forEach(item => data.splice(data.indexOf(item), 1));
    if (data.length === 0) console.error("No shows from selected channels");
    return data;
}

function hideOldItems(table) {
    const rows = getRows(table);
    for (i = 1; i < (rows.length); i++) {
        const offset = 2.5;//hours
        const time = rows[i].getElementsByTagName("td")[0];
        const minutesFromNow = getMinutesFromNow(time.innerText)
        if (minutesFromNow < -(offset * 60)) {
            rows[i].className = 'past-show';
        }
    }
    return table;
}
function sortTable(table) {
    var switching, i, x, y, shouldSwitch;
    const rows = getRows(table);
    switching = true;
    while (switching) {
        switching = false;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[0];
            y = rows[i + 1].getElementsByTagName("td")[0];
            if (getMinutesFromNow(x.innerText) > getMinutesFromNow(y.innerText)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
    return table;
}
function highlightActiveShows(table) {
    const rows = getRows(table);
    for (let i = 1; i < rows.length; i++) {
        let showtime = rows[i].getElementsByTagName("td")[0];
        let timetoshow = getMinutesFromNow(showtime.innerText);
        let channel = rows[i].getElementsByTagName("td")[1];
        let name = channel.innerText.toUpperCase();
        let margin = 15; //minutes
        let isPastShow = (rows[i].classList.contains('past-show'))
        if (!isPastShow && timetoshow < margin) {
            let channelData = allChannels.channels.find(it => it.name.toUpperCase() === name);
            let code = channelData.ch_num;
            channel.parentElement.onclick = function () { switchchannel(code); };
            channel.parentElement.className = "active-show";
        }
    }
    return table;
}
function createTable(data) {
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    Object.keys(data[0]).forEach((it, index) => headerRow.insertCell(index).textContent = it);
    for (const item of data) {
        let row = table.insertRow();
        row.insertCell(0).textContent = item.time;
        row.insertCell(1).textContent = item.channel;
        row.insertCell(2).textContent = item.movie;
    }
    return table;
}
async function getEpg() {
    try {
        const response = await fetch('/epg');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let epg_data = await response.json();
        if (!epg_data) {
            return;
        }
        epg_data = removeUnwantedChannels(epg_data);
        let table = createTable(epg_data);
        table = hideOldItems(table);
        table = sortTable(table);
        table = highlightActiveShows(table);
        const epgElement = getId('epg');
        epgElement.appendChild(table);
        makeHorizontalTable(table);
        switchTable();
    } catch (error) {
        console.error('Error:', error);
    }
}


function formatTime(time) {
    function pad(t) {
        return (t < 10) ? '0' + t : t;
    }
    const hours = Math.floor(time / (60 * 60));
    const minutes = Math.floor(time % (60 * 60) / 60);
    const seconds = Math.floor(time % 60);
    return ` ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getUpTime() {
    fetch('/uptime')
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(uptime => {
            setUpTime(Math.ceil(parseInt(uptime)));
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function setUpTime(upTime) {
    getId("uptime").style.visibility = "visible";
    function updateUpTime() {
        upTime++;
        let str_uptime = formatTime(upTime);
        getId("uptime_string").innerText = str_uptime;
    }
    setInterval(updateUpTime, 1000);
}

function makeHorizontalTable(table) {
    const rows = getRows(table);
    const n_of_h = rows[1].getElementsByTagName("td").length;
    const hTable = document.createElement("table");
    hTable.setAttribute("id", "horizontal-table");
    for (i = 0; i < n_of_h; i++) {
        let tr = document.createElement("tr");
        for (j = 0; j < rows.length; j++) {
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
    getId("epg-h").appendChild(hTable);
}

function switchTable() {
    if (window.innerWidth > window.innerHeight) {
        getId("epg-h").style.display = 'block';
        getId("epg").style.display = 'none';
    } else {
        getId("epg").style.display = 'block';
        getId("epg-h").style.display = 'none';
    }
    scrollToActiveShow();
}

function scrollToActiveShow() {
    if ($('#epg').is(':visible')) {
        let container = $('#epg');
        let lastActiveShow = container.find('.past-show:last');
        let headHeight = $('#epg td')[0].offsetHeight;
        container.scrollTop(lastActiveShow[0].nextElementSibling.offsetTop - headHeight)
    } else {
        let container = $('#epg-h');
        let lastActiveShow = container.find('.past-show:last');
        let headWidth = $('#epg-h td')[0].offsetWidth;
        container.scrollLeft(lastActiveShow[0].nextElementSibling.offsetLeft - headWidth);
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
    console.log("Processing : " + command);
    if (basicCommands.hasOwnProperty(command)) {
        let thisCommand = basicCommands[command];
        setTooltipText('sending ' + thisCommand);
        sendDthCode(thisCommand);
        return;
    } else {
        const channel = allChannels.channels.find(it => it.name.toUpperCase() === command);
        if (channel) {
            let thisCommand = channel.ch_num;
            switchchannel(thisCommand);
            let chName = channel.name
            setTooltipText('switching to ' + chName);
            return;
        } else {
            console.error(`No matching command found for "${command}"`, channel);
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
    console.dir(event);
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
    console.error(event.error)
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

async function getChannels() {
    try {
        const response = await fetch('/channeldata');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        allChannels = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

function showOffline(isOffline) {
    const controls = getId('controls');
    const channelGrid = getId('channel-grid');
    const epgTable = document.querySelector(".epg");
    if (isOffline) {
        console.error("offline");
        controls.style.display = 'none';
        channelGrid.style.display = 'none';
        epgTable.style.maxHeight = '95vh';
        epgTable.style.maxWidth = '95vw';
    } else {
        controls.style.display = 'flex';
        channelGrid.style.display = 'grid';
        epgTable.style.maxHeight = '';
        epgTable.style.maxHeight = '';
    }
}

async function fetchData() {
    try {
        await getChannels();
        getEpg();
        const available = await fetch("/", { mode: 'no-cors' });
        console.info("server reachable: " + available.ok);
        if (available.ok) {
            getUpTime();
            generateChannelCards(allChannels.channels);
            showOffline(false);
        } else {
            console.error('server down');
            showOffline(true);
        }
    } catch (error) {
        console.error('Error:', error);
        showOffline(true);
    }
}


function init() {
    adjustDivStyle(currentNavMode().value);
    //prepare theme
    const preferedTheme = localStorage.getItem("userTheme")
    setTheme(preferedTheme)
}

$(document).on('click touchstart', (e) => {
    if (document.querySelector(".epg").style.display != 'none') {
        if (!$(e.target).closest('.epg').length != 0) {
            scrollToActiveShow();
        }
    }
});

window.addEventListener('resize', () => {
    switchTable();
});
["online", "offline"].forEach(e => {
    window.addEventListener(e, () => showOffline(e === "offline"));
});
window.onload = () => {
    init();
    fetchData();
}
window.addEventListener("DOMContentLoaded", () => {
    const clickableElements = document.querySelectorAll('button, .scan-button label, .channel-card, .active-show');
    clickableElements.forEach((element) => {
        element.addEventListener('click', () => {
            navigator.vibrate(50);
        });
    });
    prepareToListen();
})


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js',)
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}