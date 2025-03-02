import { prepareToListen } from "./voice_control.js";
import { fetchData } from "./data_processing.js";
import { adjustDivStyle, currentNavMode, showOffline, setHostAddress, setTheme } from "./ui_control.js";
import { switchTable, scrollToActiveShow } from "./epg_processing.js";
import { getId } from "./utils.js";

function init() {
    adjustDivStyle(currentNavMode().value);
    const preferedTheme = localStorage.getItem("userTheme")
    setTheme(preferedTheme)
    setHostAddress();
}

window.addEventListener('resize', () => {
    switchTable();
});
["online", "offline"].forEach(e => {
    window.addEventListener(e, () => showOffline(e === "offline"));
});
window.onload = () => {
    init();
    fetchData();
    prepareToListen();
}
window.addEventListener("DOMContentLoaded", () => {
    const clickableElements = document.querySelectorAll('button, .scan-button label, .channel-card, .active-show');
    clickableElements.forEach((element) => {
        element.addEventListener('click', () => {
            navigator.vibrate(50);
        });
    });
})
$(document).on('click touchstart', (e) => {
    if (getId("epg").style.display === "block" || getId("epg-h").style.display === "block") {
        if (!$(e.target).closest('.epg').length != 0) {
            scrollToActiveShow();
        }
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js',)
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}