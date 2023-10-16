import { allChannels } from "./data_processing.js";
import { getId, getMinutesFromNow } from "./utils.js"
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
    for (let i = 1; i < (rows.length); i++) {
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
export async function getEpg() {
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

function makeHorizontalTable(table) {
    const rows = getRows(table);
    const n_of_h = rows[1].getElementsByTagName("td").length;
    const hTable = document.createElement("table");
    hTable.setAttribute("id", "horizontal-table");
    for (let i = 0; i < n_of_h; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < rows.length; j++) {
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

export function switchTable() {
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

$(document).on('click touchstart', (e) => {
    if (document.querySelector(".epg").style.display != 'none') {
        if (!$(e.target).closest('.epg').length != 0) {
            scrollToActiveShow();
        }
    }
});
