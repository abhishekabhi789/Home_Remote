var UpTime = 0;
adjustDivStyle(currentNavMode().value);

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
    for (i = 2; i < (rows.length - 1); i++) {
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
        if ((getMinutesFromNow(time.innerHTML) < -(margin * 60)) ? true : false) {
            rows[i].parentNode.removeChild(rows[i]);
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
    for (let i = 2; i < rows.length - 1; i++) {
        let showtime = rows[i].getElementsByTagName("td")[0];
        let timetoshow = getMinutesFromNow(showtime.innerHTML);
        let channel = rows[i].getElementsByTagName("td")[1];
        let name = channel.innerHTML.toUpperCase();
        let margin = 15; //minutes
        if (timetoshow < margin) {
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
                let clickListener = originalElement.onclick;
                td.onclick = clickListener;
                td.className = 'active-show';
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
}
function loadSettings() {
    //prepare theme
    let preferedTheme = localStorage.getItem("userTheme")
    setTheme(preferedTheme)
}
window.addEventListener('resize', function () {
    switchTable();
});
getUpTime();
loadSettings();
window.onload = function exampleFunction() {
    getEpg();
    makeHorizontalTable();
    switchTable();
}

