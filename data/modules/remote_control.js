import { getId } from "./utils.js";
import { currentNavMode } from "./ui_control.js";
const devices = {TV:"tv",DTH:"dth"}
export function sendNavigation(command) {
    const device = currentNavMode().value;
    (device == devices.TV) ? sendTVCode(command) : sendDthCode(command);
}
function sendCommand(device, command) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/command?device=${device}&command=${command}`, true);
    xhr.send();
}
export function sendTVCode(code) {
    const device = devices.TV;
    sendCommand(device, code);
}
export function sendDthCode(code) {
    stopScan();
    const device = devices.DTH;
    sendCommand(device, code);
}
function sendDthCustomCommand(key, value) {
    const device = devices.DTH;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/command?device=${device}&${key}=${value}`, true);
    xhr.send();
}
export function switchchannel(channel) {
    stopScan();
    const ch_num = channel.toString();
    sendDthCustomCommand('channel', ch_num);
}
export function scanChannels(event) {
    const doscan = (event.checked) ? "true" : "false";
    sendDthCustomCommand('scan', doscan);
}
function stopScan() {
    const scanButton = getId('scan-btn');
    if (scanButton.checked) scanButton.checked = false;
}
window.sendNavigation = sendNavigation;
window.sendTVCode = sendTVCode;
window.sendDthCode = sendDthCode;
window.switchchannel = switchchannel;
window.scanChannels = scanChannels;