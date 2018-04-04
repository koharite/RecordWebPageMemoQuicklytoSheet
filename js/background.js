// This function is called onload in the popup code
function getRecordInfo(callback) {

  //Inject the content script into the current page
  chrome.tabs.executeScript(null, { file: 'js/content.js'});

  // Perform the callback when a message is received from the content script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    // Call the callback function
    callback(message);
  });
}
