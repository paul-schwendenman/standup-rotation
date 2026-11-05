<script lang="ts">
	import { tick } from 'svelte';

	export let text: string;
	export let label: string;

	let copied = false;
	let failed = false;
	let fallbackEl: HTMLTextAreaElement;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			failed = true;
			await tick();
			fallbackEl.select();
		}
	};
</script>

<button class="btn btn-neutral btn-sm" on:click={copy}>{copied ? 'Copied' : label}</button>
{#if failed}
	<p class="basis-full">Couldn't copy automatically. Select the text below and copy it.</p>
	<textarea
		bind:this={fallbackEl}
		readonly
		class="textarea h-40 w-full basis-full font-mono text-xs"
		aria-label="Prompt to copy">{text}</textarea
	>
{/if}
