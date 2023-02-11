<script>
  import Standup from "./components/Standup.svelte";
  import Settings from "./components/Settings.svelte";
  import { persistable, urlHash } from "./stores";
  import { derived } from "svelte/store";
  import ThemeSelector from "./components/ThemeSelector.svelte";

  // const settings1 = persistable("settings", {
  //   welcome: "Welcome!",
  //   done: "Done.",
  //   duration: "1:00",
  //   showTimer: true,
  //   names: []
  // });

  const settings = urlHash({
    welcome: "Welcome!",
    done: "Done.",
    duration: "1:00",
    showTimer: true,
    names: [],
  });

  const namesList = derived(
    settings,
    ($settings) => {
      return $settings.names
        .filter((item) => item.active)
        .map((item) => item.name);
    },
    []
  );

  let showSettings = true;

  function handleRunning(event) {
    showSettings = !showSettings;
  }

  $: validNames = $namesList.length > 0;
</script>

<main class="mx-auto my-8 max-w-2xl p-2">
  <Standup
    names={$namesList}
    showTimer={$settings.showTimer}
    doneMessage={$settings.done}
    time={$settings.duration}
    welcome={$settings.welcome}
    on:running={handleRunning}
  />

  <input type="checkbox" id="settings-modal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <Settings {settings} />
      <div class="modal-action">
        <label for="settings-modal" class="btn btn-secondary">Save</label>
      </div>
    </div>
  </div>
</main>
<footer class="fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-2xl p-2">
    <label
      for="settings-modal"
      class="btn modal-button btn-secondary"
      class:btn-disabled={!showSettings}
    >
      Settings
    </label>
    <ThemeSelector>Theme</ThemeSelector>
  </div>
</footer>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
