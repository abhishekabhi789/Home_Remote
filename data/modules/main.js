import { prepareToListen } from "./voice_control.js";
import { fetchData } from "./data_processing.js";
import { adjustDivStyle, currentNavMode, showOffline, setHostAddress, setTheme } from "./ui_control.js";
import { switchTable } from "./epg_processing.js";

prepareToListen();

function init() {
    adjustDivStyle(currentNavMode().value);
    //prepare theme
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
}
window.addEventListener("DOMContentLoaded", () => {
    const clickableElements = document.querySelectorAll('button, .scan-button label, .channel-card, .active-show');
    clickableElements.forEach((element) => {
        element.addEventListener('click', () => {
            navigator.vibrate(50);
        });
    });
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