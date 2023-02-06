<script>
  import Standup from "./components/Standup.svelte";
  import Settings from "./components/Settings.svelte";
  import { persistable } from "./stores";

  const namesList = ["Paul", "Tyler"];
  const showTimer = persistable('showTimer', true);
  const duration = persistable('duration', "1:00");
  const welcome = persistable('welcome', 'Welcome!');
</script>

<main class="mx-auto my-8 max-w-2xl">
  <Standup {namesList} showTimer={$showTimer} time={$duration} welcome={$welcome} />

  <label for="my-modal-2" class="btn btn-outline modal-button">Settings</label>
<input type="checkbox" id="my-modal-2" class="modal-toggle">
<div class="modal">
  <div class="modal-box">
    <Settings {showTimer} {duration} {welcome} />
    <div class="modal-action">
      <label for="my-modal-2" class="btn">Close</label>
    </div>
  </div>
</div>
</main>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
