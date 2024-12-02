<script lang="ts">
    import { Wheel } from "spin-wheel";
	import { onMount } from "svelte";

    export let props;
    let wheelRef: HTMLElement;
    let wheel;

    onMount(() => {
        wheel = new Wheel(wheelRef, props)
    });
</script>

<div bind:this={wheelRef}></div>
