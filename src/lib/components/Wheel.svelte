<script lang="ts">
    import { Wheel, type WheelProps } from "spin-wheel";
	import { onMount } from "svelte";

    export let props: WheelProps;
    let wheelRef: HTMLElement;
    let wheel: Wheel;

    onMount(() => {
        wheel = new Wheel(wheelRef, props)
    });

    function handleSpin() {
        return () => {
            wheel.spin(600);
        }
    }
</script>

<button class="btn" onclick={handleSpin()}>Spin</button>
<div bind:this={wheelRef}></div>
