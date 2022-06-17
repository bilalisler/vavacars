'use strict';

var notifyListById = {}
let second = 1000;
let minute = second * 60;
var interval;

const fetchNotifications = () => {
    fetch('http://localhost:3000/')           //api for the get request
        .then(response => response.json())
        .then(messageList => {
            console.log('messageList:', messageList,(new Date()).toLocaleTimeString())
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

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'startCron') {
        console.log('START CRON', (new Date()).toLocaleTimeString())
        interval = setInterval(function () {
            console.log('interval: ',(new Date()).toLocaleTimeString())

            fetchNotifications();
        }, 5 * minute);
    } else {
        console.log('STOP CRON', (new Date()).toLocaleTimeString())
        clearInterval(interval);
    }
})


chrome.notifications.onClicked.addListener((notifyId) => { // bildirim'e tıklandığında
    let carLink = notifyListById[notifyId];
    chrome.tabs.create({url: carLink});
})






