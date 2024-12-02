<script lang="ts">
    import { Wheel, type WheelProps } from "spin-wheel";
	import { onMount } from "svelte";

    export let props: WheelProps;
    let wheelRef: HTMLElement;
    let wheel;

    onMount(() => {
        wheel = new Wheel(wheelRef, props)
    });
</script>

<div bind:this={wheelRef}></div>
