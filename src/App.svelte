<script>
  import Standup from "./components/Standup.svelte";
  import Settings from "./components/Settings.svelte";
  import { persistable } from "./stores";

  const namesList = ["Paul", "Tyler"];
  const settings = persistable("settings", {
    welcome: "Hi!",
    done: "Done.",
    duration: "1:00",
    showTimer: true,
  });
</script>

<main class="mx-auto my-8 max-w-2xl">
  <Standup
    {namesList}
    showTimer={$settings.showTimer}
    time={$settings.duration}
    welcome={$settings.welcome}
  />

  <label for="my-modal-2" class="btn btn-outline modal-button">Settings</label>
  <input type="checkbox" id="my-modal-2" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <Settings {settings} />
      <div class="modal-action">
        <label for="my-modal-2" class="btn">Save</label>
      </div>
    </div>
  </div>
</main>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
