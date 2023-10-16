import { getId, formatTime } from "./utils.js"
const themes = { LIGHT: "light", DARK: "dark", DEFAULT:"default"}
export function adjustDivStyle(selected) {
    const navButtons = document.getElementsByClassName('navigation-buttons')[0]
    if (selected == "tv") {
        navButtons.style.borderTopLeftRadius = "20px"
        navButtons.style.borderTopRightRadius = "100px"
    } else {
        navButtons.style.borderTopLeftRadius = "100px"
        navButtons.style.borderTopRightRadius = "20px"
    }
}

export function currentNavMode() {
    return document.querySelector('input[name="navigation"]:checked');
}

export function getCurrentTheme() {
    const mediaTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches) ? 'dark' : 'light';
    const manualTheme = document.documentElement.classList.value;
    const currentTheme = manualTheme === "" ? mediaTheme : manualTheme;
    return currentTheme;
}
export function setTheme(theme) {
    const button = document.querySelector('.theme-toggle-button');
    switch (theme) {
        case 'dark': {
            document.documentElement.classList.remove(themes.LIGHT);
            document.documentElement.classList.add(themes.DARK);
            button.innerHTML = '<i class="fa fa-moon-o"></i>';
            localStorage.setItem("userTheme", themes.DARK);
            break;
        }
        case 'light': {
            document.documentElement.classList.remove(themes.DARK);
            document.documentElement.classList.add(themes.LIGHT);
            localStorage.setItem("userTheme", themes.LIGHT);
            button.innerHTML = '<i class="fa fa-sun-o"></i>';
            break;
        }
        default: {
            localStorage.setItem("userTheme", themes.DEFAULT);
            document.documentElement.classList.remove(themes.DARK);
            document.documentElement.classList.remove(themes.LIGHT);
            button.innerHTML = '<i class="fa fa-adjust"></i>';
            break;
        }
    }
}

export function toggleTheme() {
    // source: https://stackoverflow.com/a/68824350
    const currentChoice = localStorage.getItem("userTheme")
    const nextTheme = (currentChoice === themes.LIGHT) ? themes.DARK : (currentChoice === themes.DARK) ? themes.DEFAULT : themes.LIGHT;
    setTheme(nextTheme);
}

export function showOffline(isOffline) {
    const controls = getId('controls');
    const channelGrid = getId('channel-grid');
    const epgTable = document.querySelector(".epg");
    const hostAddress = getId('host-address');
    if (isOffline) {
        console.error("offline");
        controls.style.display = 'none';
        channelGrid.style.display = 'none';
        hostAddress.style.visibility = 'hidden';
        epgTable.style.maxHeight = '95vh';
        epgTable.style.maxWidth = '95vw';
    } else {
        controls.style.display = 'flex';
        channelGrid.style.display = 'grid';
        hostAddress.style.visibility = 'visible';
        epgTable.style.maxHeight = '';
        epgTable.style.maxHeight = '';
    }
}
export function setUpTime(upTime) {
    getId("uptime").style.visibility = "visible";
    function updateUpTime() {
        upTime++;
        let str_uptime = formatTime(upTime);
        getId("uptime_string").innerText = str_uptime;
    }
    setInterval(updateUpTime, 1000);
}
export async function setHostAddress() {
    try {
        const response = await fetch("/ip");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const address = await response.text();
        if (!address) { return }
        const textField = getId("host-address");
        const url = `http://${address}/`
        textField.style.visibility = "visible";
        textField.innerText = url;
        textField.addEventListener('click', () => {
            navigator.clipboard.writeText(url);
            alert("the URL is copied to clipboard.");
        });
    } catch (error) {
        console.error('error fetching host address:', error);
    }
}
export function changeNav(selected) {
    adjustDivStyle(selected.value)
}

window.changeNav = changeNav
window.toggleTheme = toggleTheme