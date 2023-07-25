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
function toggleNightMode() {
    const body = document.body;
    const nightModeButton = document.querySelector('.night-mode-button');
    const isNightMode = body.classList.toggle('night-mode');
    nightModeButton.innerHTML = isNightMode ? '<i class="fa fa-sun-o"></i>' : '<i class="fa fa-moon-o"></i>';
    nightModeButton.style.backgroundColor = isNightMode ? '#333' : '';
    nightModeButton.style.color = isNightMode ? '#f5f5f5' : '';
}

function getMinutesFromNow(timeString) {
    const now = new Date();
    const [time, ampm] = timeString.split(" ");
    const [hour, minute] = time.split(/[:.]+/).map(Number);
    let hours = hour % 12;
    hours = (ampm == "PM") ? 12 + hour : hour;
    let totalMinutes = hours * 60;
    totalMinutes += minute - (now.getHours() * 60 + now.getMinutes());
    return totalMinutes;
}

function sortTable() {
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    while (switching) {
        switching = false;
        rows = document.querySelectorAll(".table-price tr");
        for (i = 2; i < (rows.length - 1); i++) {
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
function removeOldItems() {
    var rows, switching, i, x, y, shouldRemove;
    switching = true;
    while (switching) {
        switching = false;
        rows = document.querySelectorAll(".table-price tr");
        for (i = 2; i < (rows.length - 2); i++) {
            shouldRemove = false;
            x = rows[i].getElementsByTagName("td")[0];
            if ((getMinutesFromNow(x.innerHTML) < - (2 * 60)) ? true : false) {
                shouldRemove = true;
                break;
            }
        }
        if (shouldRemove) {
            rows[i].parentNode.removeChild(rows[i]);
            switching = true;
        }
    }
}
function removeUnwantedChannels() {
    var rows, switching, i, x, y, shouldRemove;
    const myChannels = ["Mazhavil Manorama", "Kairali TV", "Kairali We TV", "Amrita TV", "DD Malayalam"];
    switching = true;
    while (switching) {
        switching = false;
        rows = document.querySelectorAll(".table-price tr");
        for (i = 2; i < (rows.length - 2); i++) {
            shouldRemove = false;
            x = rows[i].getElementsByTagName("td")[1];
            let channel = x.innerHTML.toUpperCase();
            let removIt = myChannels.find(name => name.toUpperCase() === channel);
            if (!removIt) {
                shouldRemove = true;
                break;
            }
        }
        if (shouldRemove) {
            rows[i].parentNode.removeChild(rows[i]);
            switching = true;
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
    }
    xhr.open('GET', `${host}/epg`, false);
    xhr.send(null);
}

function format(seconds) {
    function pad(s) {
        return (s < 10) ? '0' + s : s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return ` ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
    document.getElementById("uptime").style.visibility = "visible"
    updateUpTime
}
function updateUpTime() {
    if (UpTime > 0) {
        UpTime++;
        let str_uptime = format(UpTime);
        document.getElementById("uptime_string").innerText = str_uptime;
    } else {
        getUpTime();
        return;
    }
}
setInterval(updateUpTime, 1000);
window.onload = function exampleFunction() {
    getEpg();
}