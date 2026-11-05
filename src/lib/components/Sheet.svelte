<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';

	// A right-hand panel with no backdrop, so the rotation beside it stays visible as a live preview.
	export let id: string;
	export let title: string;
	// For a footer that only some views of the sheet have.
	export let showFooter = true;

	let el: HTMLDivElement;
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	// returnFocus is false for a click on the page, so focus stays on whatever was clicked.
	const dispatch = createEventDispatcher<{ close: { returnFocus: boolean } }>();

	export const focus = () => el.focus();

	onMount(focus);

	// Decided on press, not click, so a text selection dragged out of the sheet doesn't close it.
	// The footer buttons that open sheets handle their own toggling.
	const handleWindowPointerdown = (event: PointerEvent) => {
		if (event.button !== 0 || !(event.target instanceof Element)) return;
		if (el.contains(event.target) || event.target.closest('[data-sheet-trigger]')) return;
		dispatch('close', { returnFocus: false });
	};
</script>

<svelte:window on:pointerdown={handleWindowPointerdown} />

<div
	bind:this={el}
	{id}
	role="dialog"
	tabindex="-1"
	aria-labelledby="{id}-title"
	class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-base-300 bg-base-200 text-base-content outline-none"
	transition:fly|global={{ x: 48, duration: reduceMotion ? 0 : 320, easing: expoOut }}
	on:keydown={(e) => e.key === 'Escape' && dispatch('close', { returnFocus: true })}
>
	<header class="flex items-center gap-2 border-b border-base-300 px-5 py-3">
		<slot name="before-title" />
		<h2 id="{id}-title" class="grow text-lg font-semibold">{title}</h2>
		<button
			class="btn btn-square btn-ghost"
			aria-label="Close"
			on:click={() => dispatch('close', { returnFocus: true })}
		>
			<svg
				class="size-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
			>
		</button>
	</header>

	<div class="flex min-h-0 grow flex-col overflow-y-auto px-5 pt-5 pb-8">
		<slot />
	</div>

	{#if $$slots.footer && showFooter}
		<footer class="flex flex-col gap-2 border-t border-base-300 px-5 py-4">
			<slot name="footer" />
		</footer>
	{/if}
</div>
