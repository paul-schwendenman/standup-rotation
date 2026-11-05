<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import BackgroundEditor from './BackgroundEditor.svelte';
	import CopyButton from './CopyButton.svelte';
	import Sheet from './Sheet.svelte';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { applyTheme, setTheme, loadTheme } from '../utils';
	import { themes, type Setting, type Theme } from '#lib/types.ts';
	import {
		SHARE_MAX_BYTES,
		isShareable,
		presets,
		svgBytes,
		type Layout,
		type ThemeBackground
	} from '#lib/background.ts';
	import {
		TEAM_THEME_ID,
		createPrompt,
		describePlaceholder,
		cacheLook,
		injectCustomThemes,
		isCustomThemeId,
		loadBackground,
		loadCustomThemes,
		loadYours,
		parseLook,
		parseTeamSetting,
		pastedBackground,
		saveBackground,
		saveCustomThemes,
		saveYours,
		themeCss,
		themeId,
		toTeamSetting,
		type CreateKind,
		type CustomTheme,
		type CustomThemeId,
		type TeamThemeId
	} from '#lib/customTheme.ts';

	export let settings: Writable<Setting>;
	// Bound by App so only one sheet is open at a time.
	export let open = false;

	// This person's picks. Unset (null / undefined) means the team's choice from the link applies.
	let currentTheme: Theme | CustomThemeId | null = null;
	let background: ThemeBackground | null | undefined = undefined;
	let mounted = false;
	let customThemes: CustomTheme[] = [];

	let view: 'look' | 'create' = 'look';
	let trigger: HTMLButtonElement;
	let sheet: Sheet;
	let describeEl: HTMLInputElement;
	let sourceEl: HTMLTextAreaElement;
	const dispatch = createEventDispatcher<{ open: void }>();

	// What Create is making. It only shapes the prompt: whatever the pasted reply holds applies.
	let kind: CreateKind = 'both';
	let style: Layout = 'tile';
	let description = '';
	let source = '';
	// The last background made with Create, kept as a tile so picking a preset doesn't lose it.
	let yours: ThemeBackground | null = null;
	// The theme this Create session is saving to, so edits to it aren't reported as replacing it.
	let sessionName: string | null = null;
	let replaced: string | null = null;

	const kinds: [CreateKind, string][] = [
		['both', 'Both'],
		['theme', 'Theme'],
		['background', 'Background']
	];
	const styles: [Layout, string][] = [
		['tile', 'Pattern'],
		['full', 'Illustration']
	];
	const kindHelp: Record<CreateKind, string> = {
		both: 'Colors and a matching background from one prompt.',
		theme: 'Just the colors. Your background stays as it is.',
		background: 'Just a background. It works with any theme.'
	};
	const pastePlaceholder: Record<CreateKind, string> = {
		both: '@plugin "daisyui/theme" { … }\n<svg viewBox="0 0 48 48">…</svg>',
		theme: '@plugin "daisyui/theme" { … }',
		background: '<svg viewBox="0 0 48 48">…</svg>'
	};
	const missingHelp: Record<CreateKind, string> = {
		both: 'Paste the whole reply, including the @plugin "daisyui/theme" block and the <svg>.',
		theme: 'Paste the whole reply, including the @plugin "daisyui/theme" block.',
		background: 'Paste the whole reply, including the <svg>…</svg> part.'
	};
	const formatKb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

	let teamThemeId: Theme | TeamThemeId | '';
	let shownTheme: Theme | CustomThemeId | TeamThemeId | '';

	$: pasteLayout = kind === 'background' ? style : ('tile' as Layout);
	$: ({ result, background: pasted } = parseLook(source, pasteLayout));
	$: if (shownBackground?.pattern === 'custom') yours = shownBackground;
	$: if (mounted) saveYours(yours);
	$: team = parseTeamSetting($settings.theme);
	$: teamThemeId = team?.builtIn ?? (team?.custom ? TEAM_THEME_ID : '');
	$: shownTheme = currentTheme || teamThemeId;
	$: shownBackground = background === undefined ? (team?.background ?? null) : background;
	$: if (mounted) {
		injectCustomThemes(customThemes, team?.custom ?? null, shownBackground);
		applyTheme(shownTheme);
		cacheLook(
			themeCss(customThemes, null, background ?? null),
			shownTheme,
			themeCss(customThemes, team?.custom ?? null, shownBackground)
		);
	}

	// What "Use this look for the team" would put in the link, compared with what's there now.
	$: shownCustom =
		shownTheme === TEAM_THEME_ID
			? (team?.custom ?? null)
			: isCustomThemeId(shownTheme)
				? (customThemes.find((t) => themeId(t.name) === shownTheme) ?? null)
				: null;
	$: proposed = toTeamSetting(
		shownCustom ??
			(shownTheme && shownTheme !== TEAM_THEME_ID && !isCustomThemeId(shownTheme)
				? shownTheme
				: null),
		shownBackground
	);
	$: inLink = team ? toTeamSetting(team.builtIn ?? team.custom, team.background) : undefined;
	$: isTeamLook = JSON.stringify(proposed) === JSON.stringify(inLink);
	$: backgroundTooBig = !!shownBackground && !isShareable(shownBackground);
	$: overridingTeam = !!team && (currentTheme !== null || background !== undefined);

	const backgroundLabel = (bg: ThemeBackground | null) =>
		!bg ? null : bg.pattern === 'custom' ? 'your SVG' : presets[bg.pattern].label;

	$: teamSummary = team
		? [team.builtIn ?? team.custom?.name, backgroundLabel(team.background)]
				.filter(Boolean)
				.join(' · ')
		: '';

	const openSheet = async (next: 'look' | 'create') => {
		open = true;
		view = next;
		dispatch('open');
		await tick();
		if (next === 'create') (source ? sourceEl : describeEl).focus();
		else sheet.focus();
	};

	const closeSheet = (returnFocus = true) => {
		open = false;
		if (returnFocus) trigger.focus();
	};

	const showLook = async () => {
		view = 'look';
		await tick();
		sheet.focus();
	};

	const handleSetTheme = (theme: Theme | CustomThemeId) => {
		if (currentTheme !== theme) {
			setTheme(theme);
			currentTheme = theme;
		} else {
			setTheme('');
			currentTheme = null;
		}
	};

	const storeCustomThemes = (updated: CustomTheme[]) => {
		customThemes = updated;
		saveCustomThemes(customThemes);
	};

	const storeBackground = (next: ThemeBackground | null | undefined) => {
		background = next;
		saveBackground(next);
	};

	const handleSourceInput = () => {
		if (source.trim() === '') sessionName = null;

		const { result, background: pasted } = parseLook(source, pasteLayout);
		const theme = result.theme;

		if (theme) {
			if (theme.name !== sessionName) {
				replaced = customThemes.some((t) => t.name === theme.name) ? theme.name : null;
				sessionName = theme.name;
			}

			storeCustomThemes([...customThemes.filter((t) => t.name !== theme.name), theme]);
			setTheme(themeId(theme.name));
			currentTheme = themeId(theme.name);
		}

		// Only on a new SVG or style, so typing in the box doesn't undo tweaks made since the paste.
		if (pasted?.svg && (background?.svg !== pasted.svg || background?.layout !== pasteLayout)) {
			storeBackground(pastedBackground(pasted.svg, pasteLayout));
		}
	};

	const setStyle = (next: Layout) => {
		style = next;
		handleSourceInput();
	};

	// Keeps an unfinished paste, so closing the sheet by accident doesn't lose it.
	const handleCreate = (next: CreateKind) => {
		kind = next;
		openSheet('create');
	};

	// Done means the paste was used; the next Create starts fresh.
	const handleDone = () => {
		source = '';
		description = '';
		sessionName = null;
		replaced = null;
		showLook();
	};

	const handleEditCustom = (theme: CustomTheme) => {
		kind = 'theme';
		source = theme.source;
		sessionName = theme.name;
		replaced = null;
		openSheet('create');
	};

	const handleRemoveCustom = (theme: CustomTheme) => {
		storeCustomThemes(customThemes.filter((t) => t.name !== theme.name));
		if (currentTheme === themeId(theme.name)) {
			setTheme('');
			currentTheme = null;
		}
		if (result.theme?.name === theme.name) {
			source = '';
		}
	};

	const handleShareWithTeam = () => {
		settings.update((s) => ({ ...s, theme: proposed }));
	};

	const handleUseTeamLook = () => {
		setTheme('');
		currentTheme = null;
		storeBackground(undefined);
	};

	const handleStopSharing = () => {
		settings.update((s) => ({ ...s, theme: undefined }));
	};

	onMount(() => {
		customThemes = loadCustomThemes();
		currentTheme = loadTheme();
		background = loadBackground();
		yours = loadYours();
		mounted = true;
	});
</script>

<button
	bind:this={trigger}
	class="btn m-1 uppercase btn-accent"
	aria-expanded={open}
	aria-controls="theme-sheet"
	data-sheet-trigger
	on:click={() => (open ? closeSheet() : openSheet(view))}><slot></slot></button
>

{#if open}
	<Sheet
		bind:this={sheet}
		id="theme-sheet"
		title={view === 'create' ? 'Create your own' : 'Theme'}
		showFooter={view === 'look'}
		on:close={(e) => closeSheet(e.detail.returnFocus)}
	>
		<svelte:fragment slot="before-title">
			{#if view === 'create'}
				<button
					class="btn -ml-2 btn-square btn-ghost"
					aria-label="Back to themes"
					on:click={showLook}
				>
					<svg
						class="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg
					>
				</button>
			{/if}
		</svelte:fragment>

		{#if view === 'look'}
			<div class="flex flex-col gap-8">
				{#if team}
					<section
						class="flex flex-col gap-2 rounded-box bg-base-100 p-4"
						aria-labelledby="team-title"
					>
						<h3 id="team-title" class="text-xs font-bold tracking-wider uppercase opacity-70">
							Team
						</h3>
						<p class="font-semibold">{teamSummary}</p>
						<p class="text-sm opacity-75">
							Saved in this page's link. It applies for anyone who hasn't picked their own.
						</p>
						<div class="mt-1 flex flex-wrap gap-2">
							{#if overridingTeam}
								<button class="btn" on:click={handleUseTeamLook}>Use the team's look</button>
							{/if}
							<button class="btn btn-ghost" on:click={handleStopSharing}>Stop sharing</button>
						</div>
					</section>
				{/if}

				<section class="flex flex-col gap-3" aria-labelledby="theme-title">
					<h3 id="theme-title" class="text-xs font-bold tracking-wider uppercase opacity-70">
						Theme
					</h3>
					<button class="btn w-full" on:click={() => handleCreate('both')}>
						<svg
							class="size-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg
						>
						Create a theme
					</button>

					{#each customThemes as theme (theme.name)}
						<div class="flex items-center gap-1">
							<button
								class="grow"
								aria-pressed={shownTheme === themeId(theme.name)}
								on:click={() => handleSetTheme(themeId(theme.name))}
							>
								<ThemeExample
									theme={themeId(theme.name)}
									label={theme.name}
									active={shownTheme === themeId(theme.name)}
								/>
							</button>
							<button
								class="btn btn-square btn-ghost"
								aria-label="Edit {theme.name}"
								on:click={() => handleEditCustom(theme)}
							>
								<svg
									class="size-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" /></svg
								>
							</button>
							<button
								class="btn btn-square btn-ghost"
								aria-label="Remove {theme.name}"
								on:click={() => handleRemoveCustom(theme)}
							>
								<svg
									class="size-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
								>
							</button>
						</div>
					{/each}

					<div class="grid grid-cols-2 gap-2">
						{#each themes as theme (theme)}
							<button aria-pressed={shownTheme === theme} on:click={() => handleSetTheme(theme)}>
								<ThemeExample {theme} active={shownTheme === theme} />
							</button>
						{/each}
					</div>
				</section>

				<BackgroundEditor
					background={shownBackground}
					{yours}
					on:change={(e) => storeBackground(e.detail)}
					on:create={() => handleCreate('background')}
				/>
			</div>
		{:else}
			<div class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<span id="create-kind" class="font-semibold">What to make</span>
					<div role="radiogroup" aria-labelledby="create-kind" class="join grid grid-cols-3">
						{#each kinds as [value, label] (value)}
							<button
								role="radio"
								aria-checked={kind === value}
								class="btn join-item"
								class:btn-active={kind === value}
								on:click={() => (kind = value)}>{label}</button
							>
						{/each}
					</div>
					{#if kind === 'background'}
						<div role="radiogroup" aria-label="Background style" class="join grid grid-cols-2">
							{#each styles as [value, label] (value)}
								<button
									role="radio"
									aria-checked={style === value}
									class="btn join-item"
									class:btn-active={style === value}
									on:click={() => setStyle(value)}>{label}</button
								>
							{/each}
						</div>
					{/if}
					<span class="text-sm opacity-75">{kindHelp[kind]}</span>
				</div>

				<label class="flex flex-col gap-1">
					<span class="font-semibold">Describe the look</span>
					<input
						bind:this={describeEl}
						bind:value={description}
						class="input w-full"
						placeholder={describePlaceholder[kind]}
					/>
				</label>

				<div class="flex flex-col gap-2">
					<span class="font-semibold">Ask an AI</span>
					<div class="flex flex-wrap items-center gap-3">
						<CopyButton text={createPrompt(kind, style, description)} label="Copy prompt" />
						<span class="text-sm opacity-75">Paste it into ChatGPT, Claude or similar.</span>
					</div>
				</div>

				<label class="flex flex-col gap-1">
					<span class="font-semibold">Paste the reply</span>
					<textarea
						bind:this={sourceEl}
						bind:value={source}
						on:input={handleSourceInput}
						class="textarea h-44 w-full font-mono text-xs whitespace-pre"
						class:textarea-error={result.errors.length > 0 || (pasted && !pasted.svg)}
						wrap="off"
						spellcheck="false"
						placeholder={pastePlaceholder[kind]}></textarea>
					<span class="text-sm opacity-75">
						Extra text is ignored. A theme from the
						<a
							class="link"
							href="https://daisyui.com/theme-generator/"
							target="_blank"
							rel="noreferrer">daisyUI theme generator</a
						> works too.
					</span>
				</label>

				{#if source.trim() !== ''}
					{#if result.errors.length > 0}
						<div role="status" class="alert flex flex-col items-start gap-1 alert-soft alert-error">
							<span class="font-semibold">
								Theme not applied: {result.errors.length}
								{result.errors.length === 1 ? 'problem' : 'problems'}
							</span>
							<ul class="list-disc pl-5">
								{#each result.errors as error (error)}
									<li>{error}</li>
								{/each}
							</ul>
						</div>
					{:else if result.theme || pasted?.svg}
						<div
							role="status"
							class="alert flex flex-col items-start gap-1 alert-soft alert-success"
						>
							{#if result.theme}
								<span class="font-semibold">Applied “{result.theme.name}”</span>
								{#if replaced === result.theme.name}
									<span>Replaced your earlier “{result.theme.name}” theme.</span>
								{:else}
									<span>Saved to your themes.</span>
								{/if}
							{/if}
							{#if pasted?.svg}
								{@const bytes = svgBytes(pasted.svg)}
								<span class:font-semibold={!result.theme}>Background applied.</span>
								<span>
									{bytes <= SHARE_MAX_BYTES
										? `Small enough to share with your team (${formatKb(bytes)}).`
										: `Too big to share with your team (${formatKb(bytes)} of ${formatKb(SHARE_MAX_BYTES)} max). It only shows for you.`}
								</span>
							{/if}
						</div>
					{:else if !pasted}
						<div role="status" class="alert flex flex-col items-start gap-1 alert-soft alert-error">
							<span class="font-semibold">Nothing to apply yet</span>
							<span>{missingHelp[kind]}</span>
						</div>
					{/if}

					{#if pasted && !pasted.svg}
						<div class="text-sm">
							<p class="font-semibold">Background not applied</p>
							<ul class="list-disc pl-5">
								{#each pasted.errors as error (error)}
									<li>{error}</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/if}

				{#if result.warnings.length > 0}
					<ul class="list-disc pl-5 text-sm opacity-75">
						{#each result.warnings as warning (warning)}
							<li>{warning}</li>
						{/each}
					</ul>
				{/if}

				{#if result.theme || pasted?.svg}
					<button class="btn self-start btn-neutral" on:click={handleDone}>Done</button>
				{/if}
			</div>
		{/if}

		<svelte:fragment slot="footer">
			<button
				class="btn w-full btn-neutral"
				disabled={isTeamLook || !proposed}
				on:click={handleShareWithTeam}>Use this look for the team</button
			>
			<p class="text-sm opacity-75">
				{#if !proposed}
					Pick a theme or background to share it with the team.
				{:else if isTeamLook}
					This is the team's look.
				{:else if backgroundTooBig}
					Your background is too big to share. The team gets the theme only.
				{:else}
					Saves your theme and background in this page's link for the whole team.
				{/if}
			</p>
		</svelte:fragment>
	</Sheet>
{/if}
