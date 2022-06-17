'use strict';

function saveForm(event) {
    console.log('event:', event)

    chrome.action.setBadgeText({text: 'ON'});
    chrome.alarms.create('testAlarm',{delayInMinutes: 1});

    chrome.storage.sync.set({minutePeriod: document.getElementById('minutePeriod').value});
    chrome.storage.sync.set({fromPrice: document.getElementById('fromPrice').value});
    chrome.storage.sync.set({toPrice: document.getElementById('toPrice').value});
    chrome.storage.sync.set({fromMilage: document.getElementById('fromMilage').value});
    chrome.storage.sync.set({toMilage: document.getElementById('toMilage').value});
    chrome.storage.sync.set({fromYear: document.getElementById('fromYear').value});
    chrome.storage.sync.set({toYear: document.getElementById('toYear').value});

   // window.close();
}

document.getElementById('saveForm').addEventListener('click', saveForm);
