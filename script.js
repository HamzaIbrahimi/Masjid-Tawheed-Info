var Socket;
var inialized = false;
var raisedAmountUpdate = false;
var paidAmount = 5.0;
var totalAmount = 18.3;
var newRaisedAmount = 0;
var resetFlag = 0;
var height = screen.height;
var width = screen.width;

console.log("screen height = %dpx", height);
console.log("screen width = %dpx", width);

function init() {
  Socket = new WebSocket("ws://" + window.location.hostname + ":81/");
  updateProgress(3.35);
  Socket.onmessage = function (event) {
    processCommand(event);
  };
  inialized = true;
}

// Update the progress bar
function updateProgress(raised) {
  var raisedAmount = raised;
  var missingAmount = totalAmount - raisedAmount - paidAmount;
  var progress = ((raisedAmount + paidAmount) / totalAmount) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
  console.log("process = %d", progress);
  console.log("raisedAmount = %d", raisedAmount);
  console.log("paidAmount = %d", paidAmount);
  console.log("missingAmount = %d", missingAmount);

  document.getElementById("progressLabel").innerHTML =
    progress.toFixed(1) + "%";

  // document.getElementById("totalAmount").innerHTML = totalAmount.toLocaleString();
  // document.getElementById("paidAmount").innerHTML = paidAmount.toFixed(1).toLocaleString();
  // document.getElementById("paidAmount").innerHTML = paidAmount.toLocaleString();
  document.getElementById("raisedAmount").innerHTML = raisedAmount
    .toFixed(2)
    .toLocaleString();
  // document.getElementById("raisedAmount").innerHTML = raisedAmount.toLocaleString();
  document.getElementById("missingAmount").innerHTML = missingAmount
    .toFixed(2)
    .toLocaleString();
  // document.getElementById("missingAmount").innerHTML = missingAmount.toLocaleString();
  document.getElementById("totalAmount").innerHTML = totalAmount
    .toFixed(2)
    .toLocaleString();
}

// Set the date we're counting down to
var countDownDate = new Date("Dec 31, 2025 23:59:59").getTime();

// Update the countdown every 1 second
var x = setInterval(function () {
  // Get the current date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("days").innerHTML = days;
  document.getElementById("hours").innerHTML = hours;
  document.getElementById("minutes").innerHTML = minutes;
  document.getElementById("seconds").innerHTML = seconds;

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("days").innerHTML = "00";
    document.getElementById("hours").innerHTML = "00";
    document.getElementById("minutes").innerHTML = "00";
    document.getElementById("seconds").innerHTML = "00";
  }
}, 1000);

function sendRaisedAmount(value) {
  var obj = { newRaisedAmount: value };
  Socket.send(JSON.stringify(obj));
  // Socket.send(JSON.stringify({newRaisedAmount: value}));
  raisedAmountUpdate = false;
}

function sendResetFlag(value) {
  var obj = { reset: value };
  Socket.send(JSON.stringify(obj));
  resetFlag = 0;
}

function processCommand(event) {
  if (inialized != true) {
    init();
  } else {
    var obj = JSON.parse(event.data);

    if (raisedAmountUpdate == true) {
      sendRaisedAmount(newRaisedAmount * 1e6);
      updateProgress(newRaisedAmount / 1e6);
      raisedAmountUpdate = false;
    } else {
      updateProgress(obj.raisedAmount / 1e6);
    }

    if (resetFlag == 1) {
      sendResetFlag(resetFlag);
      resetFlag = 0;
    }
    // updateConnectionStatus(obj.connection);
    const LinkKeys = window.location.search;
    // console.log(totalRaisedKey);
    const URLParameters = new URLSearchParams(LinkKeys);
    const raisedParameter = URLParameters.get("totalRaisedAmount");
    const resetParameter = URLParameters.get("reset");

    newRaisedAmount = parseInt(raisedParameter) / 1e6;
    resetFlag = parseInt(resetParameter);

    if (newRaisedAmount > 0 && raisedAmountUpdate == false) {
      updateProgress(newRaisedAmount / 1e6);
      raisedAmountUpdate = true;
    }
    console.log(newRaisedAmount);
    console.log(resetFlag);
  }
}
window.onload = function (event) {
  init();
};
