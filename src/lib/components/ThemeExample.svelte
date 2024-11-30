<script>
	export let theme;
</script>

<div
	class="overflow-hidden rounded-lg outline-2 outline-offset-2 outline-base-content"
	data-set-theme={theme}
	data-act-class="outline"
>
	<div data-theme={theme} class="w-full cursor-pointer bg-base-100 font-sans text-base-content">
		<div class="grid grid-cols-5 grid-rows-3">
			<div class="col-span-5 row-span-3 row-start-1 flex gap-1 px-4 py-3">
				<div class="flex-grow text-sm font-bold">{theme}</div>
				<div class="flex flex-shrink-0 flex-wrap gap-1">
					<div class="w-2 rounded bg-primary"></div>
					<div class="w-2 rounded bg-secondary"></div>
					<div class="w-2 rounded bg-accent"></div>
					<div class="w-2 rounded bg-neutral"></div>
				</div>
			</div>
		</div>
	</div>
</div>
