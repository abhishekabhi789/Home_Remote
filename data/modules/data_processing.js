import { getId } from "./utils.js";
import { getEpg } from "./epg_processing.js";
import { showOffline, setUpTime } from "./ui_control.js";
export var allChannels = [];

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


export async function fetchData() {
    try {
        await getChannels();
        getEpg();
        const abortController = new AbortController();
        const signal = abortController.signal;
        const timeout = setTimeout(() => {
            abortController.abort();
        }, 2000);
        const available = await fetch("/ip", { mode: 'no-cors', signal });
        clearTimeout(timeout)
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