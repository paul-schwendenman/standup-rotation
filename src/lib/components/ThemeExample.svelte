<script lang="ts">
	import type { Theme } from '#lib/types.ts';
	import type { CustomThemeId } from '#lib/customTheme.ts';

	export let theme: Theme | CustomThemeId;
	export let label: string = theme;
	export let active = false;
</script>

<div
	class="overflow-hidden rounded-lg outline-offset-2 outline-base-content"
	class:outline-2={active}
	class:outline-solid={active}
>
	<div data-theme={theme} class="w-full cursor-pointer bg-base-100 font-sans text-base-content">
		<div class="grid grid-cols-5 grid-rows-3">
			<div class="col-span-5 row-span-3 row-start-1 flex gap-1 px-4 py-3">
				<div class="grow text-sm font-bold">{label}</div>
				<div class="flex shrink-0 flex-wrap gap-1">
					<div class="w-2 rounded-sm bg-primary"></div>
					<div class="w-2 rounded-sm bg-secondary"></div>
					<div class="w-2 rounded-sm bg-accent"></div>
					<div class="w-2 rounded-sm bg-neutral"></div>
				</div>
			</div>
		</div>
	</div>
</div>
