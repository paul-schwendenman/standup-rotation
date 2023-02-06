<script>
  import { writable } from "svelte/store";

  export let settings = writable({
    welcome: "",
    done: "",
    duration: "1:00",
    showTimer: true,
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
</div>

<style>
  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
</style>
