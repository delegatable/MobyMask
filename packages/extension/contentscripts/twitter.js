var allowlist = [];

function addBadges() {
  let usernames = contains('span', '@');

  for (user of usernames) {
    let username = user.textContent.toLowerCase().substring(1);
    if (allowlist.some(item => item.toLowerCase() === username)) {
      if (!user.getAttribute("mobymask-tagged") && !user.parentElement.getAttribute("mobymask-tagged")) {
        var icon = document.createElement("img");
        icon.src = chrome.runtime.getURL('/logo/logo.svg');
        icon.style = "padding-left:3px;display:inline;vertical-align:text-bottom;float:none;height:15px;width:15px;left:15px;";
        icon.title = `@${username} is a MobyMask verified user`;
        icon.setAttribute('mobymask-badge', true);
        user.appendChild(icon);
        user.setAttribute("mobymask-tagged", true);
      }
    }
  }
  removeReplyToBadges();
}


function removeReplyToBadges() {
  let links = document.links;

  for (link of links) {
    if (link.parentElement.innerText.includes("Replying to")) {
      try {
        let img = link.childNodes[0].childNodes[0].childNodes[0].childNodes[1];
        let img2 = link.childNodes[0].childNodes[0].childNodes[1];

        if (img.getAttribute('mobymask-badge')) {
          img.setAttribute("style", "display:none");
        }
        if (img2.getAttribute('mobymask-badge')) {
          img2.setAttribute("style", "display:none");
        }
      } catch (error) {
        // Failed to parse new Twitter 'reply to' structure
        // Try old Twitter structure
        try {
          let img = link.childNodes[0].childNodes[2];
          let img2 = link.childNodes[0].childNodes[3];

          if (img.getAttribute('mobymask-badge')) {
            img.setAttribute("style", "display:none");
          }
          if (img2.getAttribute('mobymask-badge')) {
            img2.setAttribute("style", "display:none");
          }
        } catch (error) {
          // Unable to parse structure
        }
      }
    }
  }
}

function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return [].filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent);
  });
}

function setupObserver() {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener;

  if (MutationObserver) {
    let target = document.getElementsByTagName('body')[0];

    let config = {
      childList: true,
      subtree: true
    };

    let observer = new MutationObserver(function (mutations) {
      if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
        addBadges();
      }
    });

    observer.observe(target, config);
  }

  else if (eventListenerSupported) {
    let obj = document.getElementsByTagName('body')[0];
    obj.addEventListener('DOMNodeInserted', addBadges, false);
    obj.addEventListener('DOMNodeRemoved', addBadges, false);
  }
}

chrome.runtime.sendMessage({ func: "twitterEnabled" }, function (res) {
  if (res) {
    getTwitterAllowlist();
    addBadges();
    setupObserver();
  }
});

function getTwitterAllowlist() {
  chrome.runtime.sendMessage({ func: "twitterLists" }, function (res) {
    allowlist = res.allowlist;
  });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.func) {
    case "clearTagged":
      let tags = document.querySelectorAll('[mobymask-tagged]');
      for (tag of tags) {
        tag.removeAttribute("mobymask-tagged");
      }
      let existingBadges = document.querySelectorAll('[mobymask-badge]');
      for (badge of existingBadges) {
        badge.setAttribute("style", "display:none");
      }
      sendResponse({ success: true });
      break;
  }
  return true;
});
