<script>
  export let names = [];

  let newName = "";

  function addName() {
    names = [...names, { name: newName, active: true }];

    newName = "";
  }

  function removeItem(index) {
    return () => {
      names.splice(index, 1);
      names = names;
    };
  }
</script>

<p>Names:</p>
{#each names as name, index}
  <div class="flex items-center justify-between mb-1">
    <span class="inline-flex items-center">
      <input class="checkbox" bind:checked={name.active} type="checkbox" />
      <span class="p-2" class:inactive={!name.active}>{name.name}</span>
    </span>
    <button
      class="btn btn-circle justify-self-end"
      on:click={removeItem(index)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        /></svg
      >
    </button>
  </div>
{/each}

<div class="input-group mt-1">
  <input
    type="text"
    bind:value={newName}
    placeholder="name"
    class="input input-bordered"
  />
  <button class="btn" on:click={addName}>Add</button>
</div>

<style>
  .inactive {
    text-decoration: line-through;
  }
</style>
