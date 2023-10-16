import { getId, delay } from "./utils.js"
import { allChannels } from "./data_processing.js";
const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
let tooltipTimeout = null;
const micButton = getId("voiceInput")
const tooltipText = getId("tooltip-text")
const basicCommands = {
    "CHANNEL UP": "nav_up", "CHANNEL DOWN": "nav_down", "PREVIOUS": "last_ch",
    "VOLUME UP": "vol_up", "VOLUME DOWN": "vol_down", "MUTE": "mute", "OK": "ok", "BACK": "back"
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



export function prepareToListen() {
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
