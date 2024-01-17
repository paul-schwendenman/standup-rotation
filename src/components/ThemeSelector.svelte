<script>
  import ThemeExample from "./ThemeExample.svelte";
  import { onMount } from "svelte";
  import { setTheme, loadTheme } from "./utils";

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ];
  let currentTheme;

  const handleSetTheme = (theme) => {
    if (currentTheme !== theme) {
      setTheme(theme);
      currentTheme = theme;
    } else {
      setTheme("");
      currentTheme = undefined;
    }
  };

  onMount(() => {
    currentTheme = loadTheme();
  });
</script>

<div class="dropdown dropdown-top">
  <button tabindex="-1" class="btn btn-accent m-1 uppercase">Theme</button>
  <div
    class="dropdown-content w-52 overflow-y-auto bg-base-200 h-[70vh] rounded"
  >
    <div class="grid grid-cols-1 gap-3 p-3">
      {#each themes as theme (theme)}
        <button on:click={() => handleSetTheme(theme)}>
          <ThemeExample {theme} />
        </button>
      {/each}
    </div>
  </div>
</div>
