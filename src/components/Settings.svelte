<script>
  import { writable } from "svelte/store";
    import EditNames from "./EditNames.svelte";

  export let settings = writable({
    welcome: "",
    done: "",
    duration: "1:00",
    showTimer: true,
	names: []
  });
</script>

<div>
  <label>
    <span>Show timer:</span>
    <input bind:checked={$settings.showTimer} type="checkbox" class="toggle" />
  </label>

  <label>
    <span>Duration:</span>
    <input
      bind:value={$settings.duration}
      type="text"
      class="input input-bordered"
      disabled={!$settings.showTimer}
    />
  </label>

  <label>
    <span>Welcome message:</span>
    <input
      bind:value={$settings.welcome}
      type="text"
      class="input input-bordered"
    />
  </label>

  <label>
    <span>Done message:</span>
    <input
      bind:value={$settings.done}
      type="text"
      class="input input-bordered"
    />
  </label>

  <EditNames bind:names={$settings.names}/>
</div>

<style>
  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
</style>
