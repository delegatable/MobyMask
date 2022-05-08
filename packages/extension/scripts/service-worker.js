// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log("This prints to the console of the service worker (background script)")

// Importing and using functionality from external files is also possible.
importScripts('service-worker-utils.js')
require('./api.js');

let twitterAllowlist = [];

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.func) {
    case "twitterLists":
      sendResponse({ allowlist: twitterAllowlist });
      break;
  }
});

function loadLists () {
  chrome.storage.sync.get(['twitterAllowList'], async function(result) {
    if (!result.twitterAllowList) {
      result = await getTwitterAllowList();
    }


  });
}

async function getTwitterAllowList() {

}

function checkEntity (identifier) {
  chrome.storage.sync.get([`entity-${identifier}`], async function(result) {
    if (!result) {
      result = await askServerAbout(identifier);
    }


  });
}

async function askServerAbout(identifier) {

}

function notifyOfPhisher (phisherId, isPhisher=true) {
  broadcast({
    type: 'mobymask-phisher',
    value: { phisherId, isPhisher },
  });
}

function notifyOfMember (memberId, isMember=true) {
  broadcast({
    type: 'mobymask-member',
    value: { memberId, isMember },
  });
}

function broadcast (message) {
  chrome.runtime.sendMessage(message);
}

chrome.storage.sync.set({key: value}, function() {
  console.log('Value is set to ' + value);
});

chrome.storage.sync.get(['key'], function(result) {
  console.log('Value currently is ' + result.key);
});

// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.
//
