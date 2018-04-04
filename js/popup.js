// This callbak function is called when the content script has been injected
// and returned its results.
function onPageReceived(pageInfo) {
  //document.getElementById('webTitle').value = pageInfo.title;
  //document.getElementById('webURL').value= pageInfo.url;
  //document.getElementById('memo').innerText = pageInfo.memo;
  $("#webTitle").val(pageInfo.title);
  $("#webURL").val(pageInfo.url);
  $("#memo").val(pageInfo.memo);
}

// When the popup.html has loaded
//window.addEventListener('load', function(evt) {
//$(document).ready(function () {
$(document).ready(function(){

  // Get the viwing web page info
  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    backgroundPage.getRecordInfo(onPageReceived);
  })

  // ------------------------------------------------------------->
  // Update popup.html element using localStorage value that setted option page.
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  var yyyy = ("0000" + year).slice(-4);
  var mm = ("00" + month).slice(-2);
  var dd = ("00" + day).slice(-2);
  var curDate = yyyy + "-" + mm + "-" + dd;
  $("#recordDate").val(curDate);

  // Get recorder name
  if(localStorage["recorderNum"]){
    var recorderNumStr = localStorage["recorderNum"];
    var recorderNum = parseInt(recorderNumStr, 10);
    var recorderKey;
    var recorderName;
    for(var n = 1; n <= recorderNum; n++){
      recorderKey = "recorder" + n.toString(10);
      for(var i = 0; i < localStorage.length; i++){
        if( localStorage.key(i) == recorderKey){
          recorderName = localStorage.getItem(recorderKey);
          $("#recorder").append($("<option>").html(recorderName).val(n.toString(10)));
        }
      }
    }
  }

  // Get category name
  if(localStorage["workSheetNum"]) {
    var workSheetNumStr = localStorage["workSheetNum"];
    var workSheetNum = parseInt(workSheetNumStr, 10);
    var workSheetCategoryNameKey;
    var workSheetCategoryName;
    var wsNoStr;
    for(var i = 0; i < workSheetNum; i++) {
      wsNoStr = i.toString(10);
      workSheetCategoryNameKey = "workSheet" + wsNoStr + "CategoryName";
      workSheetCategoryName = localStorage.getItem(workSheetCategoryNameKey);
      $("#infoCategory").append($("<option>").html(workSheetCategoryName).val(wsNoStr));
    }
  }

  // <-------------------------------------------------------------

  // Handle the send sheet form submit event with my sheet send function
  //$("#sendSheet").on('click', recordSheet);
  $("#sendSheet").on('click', function(e) {
    var gsheetURL = "https://sheets.googleapis.com/v4/spreadsheets/";
    var sheetID;
    if(localStorage["recordSheetID"]){
      sheetID = localStorage["recordSheetID"];
    }
    else{
      alert('記録先のシートIDをオプション画面から設定してください');
      chrome.tabs.create({
        "url":chrome.extension.getURL("options.html"),
      });

      return -1;
    }
    var sheetURL = gsheetURL + sheetID + ":batchUpdate";
    //var sheetURL = gsheetURL + sheetID;

    e.preventDefault();

    var webTitle = $("#webTitle").val();
    var webURL = $("#webURL").val();
    var memo = $("#memo").val();
    var infoRank =  $("#infoRank option:selected").text();
    var infoCategory = $("#infoCategory option:selected").text();
    var optionalInfo = $("#optionalInfo").val();
    var categorySelectedVal = $("#infoCategory").val();
    var categorySelectedValStr = categorySelectedVal.toString(10);
    var recorder = $("#recorder option:selected").text();
    var recordDate = $("#recordDate").val();

    var targetWorkSheetIdKey = "workSheet" + categorySelectedValStr + "Id";
    var targetWorkSheetId = localStorage.getItem(targetWorkSheetIdKey);
    if (targetWorkSheetId == null){
      targetWorkSheetId = 0;
    }

    // create information format to send
    var body = JSON.stringify({
      "requests": [
        {
          "appendCells": {
            "sheetId": targetWorkSheetId,

            "rows": [
              {
                "values": [
                  {},
                  {
                    "userEnteredValue": {
                      "stringValue": recordDate
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": webTitle
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": webURL
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": memo
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": infoRank
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": infoCategory
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": optionalInfo
                    }
                  },
                  {
                    "userEnteredValue": {
                      "stringValue": recorder
                    }
                  },
                ],
              }
            ],
            "fields": "userEnteredValue"
          }
        }
      ]
    });

    // connect with identity token
    chrome.identity.getAuthToken({
      'interactive': true
      },
      function(access_token) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', sheetURL, true);
        //xhr.open('GET', sheetURL, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if(xhr.readyState == 4) {
            if(xhr.status == 200){
              var data = JSON.parse(xhr.responseText);
              alert('Success to send');

            }
            else if(xhr.status == 401){
              alert('Network Error 401');
              chrome.identity.removeCachedAuthToken({'token': access_token});
            }
          }
        }
        xhr.send(body);
      }
    );
  });
});
