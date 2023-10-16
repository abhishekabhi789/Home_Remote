export function getId(item) {
    return document.getElementById(item);
}

export async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function getMinutesFromNow(timeString) {
    const now = new Date();
    const [time, ampm] = timeString.split(" ");
    const [hour, minute] = time.split(/[:.]+/).map(Number);
    let hours = hour % 12;
    hours = (ampm == "PM") ? 12 + hours : hours;
    let totalMinutes = hours * 60 + minute;
    totalMinutes -= (now.getHours() * 60 + now.getMinutes());
    return totalMinutes;
}

export function formatTime(time) {
    function pad(t) {
        return (t < 10) ? '0' + t : t;
    }
    const hours = Math.floor(time / (60 * 60));
    const minutes = Math.floor(time % (60 * 60) / 60);
    const seconds = Math.floor(time % 60);
    return ` ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
