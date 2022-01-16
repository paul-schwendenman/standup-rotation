<script>
  import { onMount } from "svelte";

  // Change to false if you don't want a timer
  export let showTimer = true;
  export let time = "1:00";
  // Add list of names here

  export let namesList = [
    "Adam",
    "Adrian",
    "Carson",
    "Dennis",
    "Ed",
    "Hardik",
    "Johan",
    "Kathryn",
    "Kelsey",
    "Patrick",
    "Paul",
    "Ren",
    "Ryan",
    "Sergiu",
    "Tyler",
  ];

  var timeOutId;

  // Default variables
  let i = 0;
  let x = 0;
  let intervalHandle = null;

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }


  onMount(() => {
    const startButton = document.getElementById("startButton");
    const shuffleButton = document.getElementById("shuffleButton");
    const nextButton = document.getElementById("nextButton");
    const skipButton = document.getElementById("skipButton");
    const headerOne = document.getElementById("headerNames");
    const nextName = document.getElementById("previewName");
    const timerWrapper = document.getElementById("timerWrapper");
    const timer = document.getElementById("timer");

    // Optional countdown timer
    // Add zero in front of numbers < 10
    function checkSecond(sec) {
      if (sec < 10 && sec >= 0) {
        sec = "0" + sec;
      }
      if (sec < 0) {
        sec = "59";
      }
      return sec;
    }

    function next() {
      if (timer.innerHTML === "Over time!") {
        startTimer();
      }
      timer.innerHTML = time;
      if (i == namesList.length - 1) {
        skipButton.style.display = "none";
        nextButton.style.display = "none";
        startButton.style.display = "inline-block";
        shuffleButton.style.display = "inline-block";
        startButton.innerHTML = "Restart";
        nextName.textContent = "";
        // nextName.textContent = namesList[0];
        headerNames.textContent = "Done!";
        timerWrapper.classList.remove("visible");
        clearTimeout(timeOutId);
      } else {
        headerNames.textContent = namesList[++i];
        nextName.textContent = namesList[i + 1] || "Done!";
        if (showTimer === true) {
          timerWrapper.classList.add("visible");
        }
        timer.innerHTML = time;
      }
    }

    const startTimer = function () {
      const presentTime = timer.innerHTML;
      const timeArray = presentTime.split(/[:]+/);
      let m = timeArray[0];
      let s = checkSecond(timeArray[1] - 1);

      if (s == 59) {
        m = m - 1;
      }
      if (s == 0 && m == 0) {
        timer.innerHTML = "Over time!";
      } else {
        timer.innerHTML = m + ":" + s;
        timeOutId = setTimeout(startTimer, 1000);
      }
    };

    // Start stand-up
    startButton.addEventListener("click", function () {
      this.style.display = "none";
      shuffleButton.style.display = "none";
      nextButton.style.display = "inline-block";
      skipButton.style.display = "inline-block";
      nextName.style.display = "inline";
      timerWrapper.classList.add("visible");

      //namesList = shuffle(namesList);
      i = 0;
      headerNames.textContent = namesList[i];
      nextName.textContent = namesList[i + 1];
      timer.innerHTML = time;
      startTimer();
    });

    shuffleButton.addEventListener("click", function () {
      namesList = shuffle(namesList);
      nextName.textContent = namesList[0];
    });

    nextButton.addEventListener("click", function () {
      next();
    });

    skipButton.addEventListener("click", function () {
      namesList.push(headerNames.textContent);
      next();
    });
    document.addEventListener("DOMContentLoaded", function () {
      namesList = shuffle(namesList);
      nextName.textContent = namesList[0];
    });
  });
</script>

<div style="text-align: center">
  <h1 id="headerNames">Welcome to stand-up</h1>
  <h3 id="previewName" />
</div>
<div style="text-align: center">
  <div class="button" id="startButton">
    <label class="unselectable">start</label>
  </div>
  <div class="button" id="shuffleButton">
    <label class="unselectable">shuffle</label>
  </div>
  <div class="button" id="nextButton">
    <label class="unselectable">next</label>
  </div>
  <div class="button" id="skipButton">
    <label class="unselectable">re-enqueue</label>
  </div>
</div>
<div id="timerWrapper">Time left: <span id="timer" /></div>

<style>
  body {
    background: #333;
  }

  h1#headerNames {
    margin-top: 10%;
    color: #fff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 75px;
    text-align: center;
    cursor: pointer;
    display: inline;
    vertical-align: bottom;
  }

  h3#previewName {
    margin-top: 10%;
    color: #666;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 25px;
    text-align: center;
    cursor: pointer;
    display: inline;
    vertical-align: bottom;
  }

  .unselectable {
    user-select: none;
  }

  .button {
    width: 100px;
    margin: auto;
    padding: 20px;
    background: #00b1ac;
    border: 3px solid #fff;
    border-radius: 10px;
    color: #fff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: inline-block;
    cursor: pointer;
  }

  #nextButton {
    display: none;
  }

  #shuffleButton {
    background: #666;
  }

  #skipButton {
    background: #666;
    font-size: 10px;
    display: none;
  }

  #timerWrapper {
    margin: 50px 0;
    color: #fff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 30px;
    text-align: center;
    opacity: 0;
    transition: opacity 1s;
  }
  #timerWrapper.visible {
    opacity: 1;
  }

  @media only screen and (max-width: 600px) {
    h1 {
      font-size: 50px;
    }
  }
</style>
