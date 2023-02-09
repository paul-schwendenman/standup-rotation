<script>
  import Standup from "./components/Standup.svelte";
  import Settings from "./components/Settings.svelte";
  import { persistable, urlHash } from "./stores";
  import { derived } from "svelte/store";

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
    names: []
  });

  const namesList = derived(settings, ($settings) => {
    return $settings.names.filter(item => item.active).map(item => item.name);
  }, []);

  let showSettings = true;

  function handleRunning(event) {
    showSettings = !showSettings;
  }

  $: validNames = $namesList.length > 0
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

  {#if showSettings}
  <label for="my-modal-2" class="btn modal-button" class:btn-outline={validNames} class:btn-secondary={!validNames}>Settings</label>
  {/if}
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
