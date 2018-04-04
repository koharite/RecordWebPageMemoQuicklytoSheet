$(document).ready(function() {

  //$("#userAuthBtn").on('click', authorizeUser);
  $("#userAuthBtn").on('click', function(e){
    var gapiURL = "https://www.googleapis.com/drive/v2/about";
    //var gapiURL = "https://sheets.googleapis.com/v4/spreadsheets/";
    var sheetID;
    if(localStorage["recordSheetID"]){
      sheetID = localStorage["recordSheetID"];
    }
    else{
      alert('記録先のシートIDをオプション画面から設定してください\n Enter sheet ID for record on ahead.');
      return -1;
    }
    //var gapiURL = gapiURL + sheetID;

    e.preventDefault();

    chrome.identity.getAuthToken({
      'interactive': true
      },
      function(access_token) {

        var auth_xhr = new XMLHttpRequest();
        auth_xhr.open('GET', gapiURL, true);
        auth_xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        auth_xhr.setRequestHeader('Content-Type', 'application/json');
        auth_xhr.onreadystatechange = function() {
          if(auth_xhr.readyState == 4) {
            if(auth_xhr.status == 200) {
              var data = JSON.parse(auth_xhr.responseText);
              var userInfo = data["user"];
              var emailAddress = userInfo["emailAddress"];
              localStorage["authUser"] = emailAddress;
              //$("#accountInfo").prop("disabled", false);
              //$("#accountInfo").prop("readonly", true);
              //$("#accountInfo").val(emailAddress);
              location.reload();

              alert('User authorize success');
            }
            else if(auth_xhr.status == 401) {
              alert('Network error 401. Try Again.');
              chrome.identity.removeCachedAuthToken({'token': access_token});
            }
          }
        }
        auth_xhr.send(null);
      }
    );
  });

  // Handle the record sheet ID submit event with saveRecordSheetID function
  $("#sheetIDSave").on('click', saveRecordSheetID);

  // Handle the record person submit event with saveRecordSheetID function
  $("#recorderSave").on('click', saveRecorderName);

  $("#getWorkSheet").on('click', function(e){
    e.preventDefault();

    var gsheetURL = "https://sheets.googleapis.com/v4/spreadsheets/";
    var sheetID;
    var wsNum;
    var wsNumStr;
    var workSheetName;
    var workSheetId;
    var workSheetNameKey;
    var workSheetIdKey;
    var wsNoStr;

    if(localStorage["recordSheetID"]){
      sheetID = localStorage["recordSheetID"];
    }
    else{
      alert('Error:記録先のsheet IDを先に入力してください\n Enter record sheet ID on ahead.');
      return -1;
    }
    var sheetURL = gsheetURL + sheetID;
    chrome.identity.getAuthToken({
      'interactive': true
      },
      function(sheet_token) {
        //alert('token get');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', sheetURL, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + sheet_token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {

          if(xhr.readyState == 4) {
            if(xhr.status == 200) {
              //alert('connection success');
              var data = JSON.parse(xhr.responseText);
              // search seet ID corresponding with sheet name
              for(var key in data) {
                if(key == "sheets"){
                  // Get all worksheet info
                  var sheetsInfo = data[key];
                  // Get target worksheet info
                  wsNum = sheetsInfo.length;
                  wsNumStr = wsNum.toString(10);
                  localStorage.setItem("workSheetNum", wsNumStr);
                  for(var i = 0; i < sheetsInfo.length; i++) {
                    workSheetName = sheetsInfo[i].properties.title;
                    workSheetId = sheetsInfo[i].properties.sheetId;
                    wsNoStr = i.toString(10);
                    workSheetNameKey = "workSheet" + wsNoStr + "Name";
                    workSheetIdKey = "workSheet" + wsNoStr + "Id";
                    localStorage.setItem(workSheetNameKey, workSheetName);
                    localStorage.setItem(workSheetIdKey, workSheetId);

                    //$("#workSheetList").append($("<option>").html(workSheetName).val(wsNoStr));
                    //$("#workSheetList").val(i);
                    location.reload();
                  }
                }
              }
              alert('success to get worksheet Information.');
            }

            else if(xhr.status == 401) {
              alert('Network error 401');
              chrome.identity.removeCachedAuthToken({'token': sheet_token});
            }
          }
        }
        xhr.send(null);
        //alert('xhr send');
      }
    );

  });

  // Handle the submit event with linkWorkSheetToCategory function that linking worksheet name to category name
  $("#linkWsCategory").on('click', linkWorkSheetToCategory);

  // -------------------------------------------------->
  // Update html element
  if(localStorage["authUser"]) {
    $("#accountInfo").prop("disabled", false);
    $("#accountInfo").prop("readonly", true);
    $("#accountInfo").val(localStorage["authUser"]);
  }

  if(localStorage["recorderNum"]){
    var recorderNum = localStorage["recorderNum"];
    var recorderKey;
    var recorderName;
    for(var n = 1; n <= recorderNum; n++){
      recorderKey = "recorder" + n.toString(10);
      recorderName = localStorage.getItem(recorderKey);
      if ( recorderName != null) {
        $("#recorderList").append($("<option>").html(recorderName).val(n.toString(10)));
      }
    }
  }

  // Get record Google SpreadSheet ID
  if(localStorage["recordSheetID"]) {
    $("#currentSheetID").val(localStorage["recordSheetID"]);
  }


  if(localStorage["workSheetNum"]) {
    wsNumStr = localStorage["workSheetNum"];
    wsNum = parseInt(wsNumStr, 10);
    for(var i = 0; i < wsNum; i++){
      wsNoStr = i.toString(10);
      workSheetNameKey = "workSheet" + wsNoStr + "Name";
      workSheetName = localStorage.getItem(workSheetNameKey);
      //$("#workSheetList").val(workSheetName);
      $("#workSheetList").append($("<option>").html(workSheetName).val(wsNoStr));
    }
  }


  if(!localStorage["workSheet0CategoryName"]){
    localStorage.setItem("workSheet0CategoryName", "None");
    $("#categoryName").val("None");
  }

  $("#workSheetList").change( function() {
    var wsSelectedVal = $("#workSheetList").val();
    var wsSelectedValStr = wsSelectedVal.toString(10);
    var wsCategoryNameKey = "workSheet" + wsSelectedValStr + "CategoryName";
    var wsCategoryName = localStorage.getItem(wsCategoryNameKey);
    if (wsCategoryName != null) {
      $("#categoryName").prop('disabled', false);
      $("#categoryName").val(wsCategoryName);
    }
    else{
      $("#categoryName").val("-");
    }
  });
  // <--------------------------------------------------

});


// Save record Google Spreadsheet ID by user setting
function saveRecordSheetID() {
  //var sheetID = document.forms.sheetEntry.recordSheetID.value;
  var sheetID = $("#recordSheetID").val();
  localStorage["recordSheetID"] = sheetID;
  $("#currentSheetID").val(sheetID);

}

// Save new recorder name by user setting
function saveRecorderName() {
  var recorderName = $("#newRecorder").val();
  var recorderNum = 0;
  var recorderNumStr;
  var nameExist = false;


  if(!localStorage.recorderNum){
    recorderNumStr = recorderNum.toString(10);
    localStorage.setItem('recorderNum', recorderNumStr);
  }
  else{
    for (var i = 0; i < localStorage.length; i++ ) {
      if ( localStorage[i] == recorderName) {
        nameExist = true;
      }
    }
  }

  var recorderKey;
  var storageRecorderNum;
  if( nameExist == false ){
    storageRecorderNum = parseInt(localStorage.recorderNum, 10);
    storageRecorderNum = storageRecorderNum  + 1;
    localStorage.recorderNum = storageRecorderNum;
    recorderKey = "recorder" + storageRecorderNum.toString(10);
    recorderNum = localStorage.recorderNum;
    localStorage.setItem(recorderKey, recorderName);
    //$("#recorderList").append($("<option>").val(recorderNum).text(recorderName));
    //$("#recorderList").append($("<option>").html(recorderName).val(recorderNum));
    //$("#recorderList").val(recorderNum);
  }
  return recorderName;
}

// Link WorkSheet ID to Category Name.
function linkWorkSheetToCategory(){
  var categoryName;
  var wsCategoryNameKey;
  categoryName = $("#categoryName").val();

  var selectedWsVal = $("#workSheetList").val();
  var selectedWsValStr = selectedWsVal.toString(10);
  if(categoryName != "") {
    wsCategoryNameKey = "workSheet" + selectedWsValStr + "CategoryName";
    localStorage.setItem(wsCategoryNameKey, categoryName);
    //$("#workSheetList").val(selectedWsVal);
  }
}
