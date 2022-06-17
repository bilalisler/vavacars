'use strict';

var notifyListById = {}
let second = 1000;
let minute = second * 60;
var interval;

const fetchNotifications = () => {
    fetch('http://localhost:3000/')           //api for the get request
        .then(response => response.json())
        .then(messageList => {
            console.log('messageList:', messageList)
            if (messageList.length > 0) {
                for (const [index, message] of Object.entries(messageList)) {
                    let notifyId = 'notify_' + index;

                    notifyListById[notifyId] = message.link;

                    chrome.notifications.create(notifyId, {
                        type: 'basic',
                        iconUrl: 'images/icon48.png',
                        title: message.title,
                        message: message.link,
                        priority: 0
                    });
                }
            }
        });
}

function startCron(event) {
    chrome.action.setBadgeText({text: 'START'});
    interval = setInterval(function () {
        console.log('Start Interval');
        fetchNotifications();
    }, 5 * minute);
    window.close();
}

function stopCron(event) {
    chrome.action.setBadgeText({text: 'STOP'});
    clearInterval(interval);
    window.close();
}

chrome.notifications.onClicked.addListener((notifyId) => { // bildirim'e tıklandığında
    let carLink = notifyListById[notifyId];
    chrome.tabs.create({url: carLink});
})


document.getElementById('startCron').addEventListener('click', startCron);
document.getElementById('stopCron').addEventListener('click', stopCron);
