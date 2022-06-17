'use strict';

var notifyListById = {}
let second = 1000;
let minute = second * 60;
var interval;

chrome.alarms.onAlarm.addListener(async (alarm) => {
    let minutePeriod = await chrome.storage.sync.get(['minutePeriod']);
    let fromPrice = await chrome.storage.sync.get(['fromPrice']);
    let toPrice = await chrome.storage.sync.get(['toPrice']);
    let fromMilage = await chrome.storage.sync.get(['fromMilage']);
    let toMilage = await chrome.storage.sync.get(['toMilage']);
    let fromYear = await chrome.storage.sync.get(['fromYear']);
    let toYear = await chrome.storage.sync.get(['toYear']);

    minutePeriod = minutePeriod['minutePeriod'];
    fromPrice = fromPrice['fromPrice'];
    toPrice = toPrice['toPrice'];
    fromMilage = fromMilage['fromMilage'];
    toMilage = toMilage['toMilage'];
    fromYear = fromYear['fromYear'];
    toYear = toYear['toYear'];

    interval = setInterval(function () {
        fetch('http://localhost:3000/')           //api for the get request
            .then(response => response.json())
            .then(messageList => {
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
    }, 5 * minute);
})


chrome.notifications.onClicked.addListener((notifyId) => { // bildirim'e tıklandığında
    let carLink = notifyListById[notifyId];
    chrome.tabs.create({url: carLink});
})






