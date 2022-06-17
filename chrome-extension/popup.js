'use strict';

function startCron(event) {
    chrome.action.setBadgeText({text: 'START'});
    chrome.alarms.create('startCron', {when: Date.now()});

    //window.close();
}

function stopCron(event) {
    chrome.action.setBadgeText({text: 'STOP'});
    chrome.alarms.create('stopCron', {when: Date.now()});

    window.close();
}

document.getElementById('startCron').addEventListener('click', startCron);
document.getElementById('stopCron').addEventListener('click', stopCron);
