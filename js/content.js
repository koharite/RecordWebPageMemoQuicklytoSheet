// Send a message containing the page details back to the event page


chrome.runtime.sendMessage({
  'title': document.title,
  'url': window.location.href,
  // this js file doesn't declare in manifest.json
  // and execute in background.js, so lower format can't be used
  //'title': chrome.tab.title,
  //'url': chrome.tab.url,
  'memo': window.getSelection().toString(),

});
