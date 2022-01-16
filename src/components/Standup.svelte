<script>
  import { onMount } from "svelte";
  import { shuffle } from "./utils";

  export let showTimer = true;
  export let time = "1:00";
  export let welcome = "Welcome to stand-up";

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

  let started = false;
  let currentName;
  let nextName;
  let timer = "";
  let startText = "start";

  let i = 0;

  function shuffleNames() {
    namesList = shuffle(namesList);
    nextName = namesList[0];
  }

  function next() {
    if (timer === "Over time!") {
      startTimer();
    }
    timer = time;
    if (i == namesList.length - 1) {
      started = false;
      startText = "Restart";
      nextName = "";
      welcome = "Done!";
      clearTimeout(timeOutId);
    } else {
      currentName = namesList[++i];
      nextName = namesList[i + 1] || "Done!";
      timer = time;
    }
  }

  function start() {
    started = true;

    //namesList = shuffle(namesList);
    i = 0;
    currentName = namesList[i];
    nextName = namesList[i + 1];
    timer = time;
    startTimer();
  }

  function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
      sec = "0" + sec;
    }
    if (sec < 0) {
      sec = "59";
    }
    return sec;
  }

  const startTimer = function () {
    const presentTime = timer;
    const timeArray = presentTime.split(/[:]+/);
    let m = timeArray[0];
    let s = checkSecond(timeArray[1] - 1);

    if (s == 59) {
      m = m - 1;
    }
    if (s == 0 && m == 0) {
      timer = "Over time!";
    } else {
      timer = m + ":" + s;
      timeOutId = setTimeout(startTimer, 1000);
    }
  };

  function skip() {
    namesList.push(currentName);
    next();
  }

  onMount(() => {
    shuffleNames();
  });
</script>

<div>
  <section>
    <span class="text-5xl">{started ? currentName : welcome}</span>
    <span class="text-2xl text-base-200">{nextName}</span>
  </section>

  <section>
    {#if !started}
      <button on:click={start} class="btn btn-primary">{startText}</button>
      <button on:click={shuffleNames} class="btn">shuffle</button>
    {:else}
      <button on:click={next} class="btn btn-primary">next</button>
      <button on:click={skip} class="btn">re-enqueue</button>
    {/if}
  </section>

  {#if started && showTimer}
    <section>
      <div class="text-2xl">
        Time left: <span id="timer">{timer}</span>
      </div>
    </section>
  {/if}
</div>

<style>
  section {
    @apply flex justify-center items-baseline mb-8 gap-2;
  }
</style>
