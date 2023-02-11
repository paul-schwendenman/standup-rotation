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
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter'
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

<div
  class="rounded-box grid grid-cols-2 gap-4 md:grid-cols-2"
>
  {#each themes as theme (theme)}
    <div
      on:click={() => handleSetTheme(theme)}
      class="border-base-content/20 hover:border-base-content/40 outline-base-content overflow-hidden rounded-lg border outline-2 outline-offset-2"
      class:outline={currentTheme === theme}
      data-set-theme={theme}
      data-act-class="outline"
    >
      <ThemeExample {theme} />
    </div>
  {/each}
</div>
