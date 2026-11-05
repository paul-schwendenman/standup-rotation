<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import BackgroundEditor from './BackgroundEditor.svelte';
	import CopyButton from './CopyButton.svelte';
	import Sheet from './Sheet.svelte';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { applyTheme, setTheme, loadTheme } from '../utils';
	import { themes, type Setting, type Theme } from '#lib/types.ts';
	import { isShareable, presets, type ThemeBackground } from '#lib/background.ts';
	import {
		DESCRIBE_PLACEHOLDER,
		TEAM_THEME_ID,
		injectCustomThemes,
		isCustomThemeId,
		loadBackground,
		loadCustomThemes,
		lookPrompt,
		parseLook,
		parseTeamSetting,
		pastedBackground,
		saveBackground,
		saveCustomThemes,
		themeId,
		toTeamSetting,
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

	let description = '';
	let source = '';
	// The theme this Create session is saving to, so edits to it aren't reported as replacing it.
	let sessionName: string | null = null;
	let replaced: string | null = null;

	let teamThemeId: Theme | TeamThemeId | '';
	let shownTheme: Theme | CustomThemeId | TeamThemeId | '';

	$: ({ result, background: pasted } = parseLook(source));
	$: team = parseTeamSetting($settings.theme);
	$: teamThemeId = team?.builtIn ?? (team?.custom ? TEAM_THEME_ID : '');
	$: shownTheme = currentTheme || teamThemeId;
	$: shownBackground = background === undefined ? (team?.background ?? null) : background;
	$: if (mounted) {
		injectCustomThemes(customThemes, team?.custom ?? null, shownBackground);
		applyTheme(shownTheme);
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

	const closeSheet = () => {
		open = false;
		trigger.focus();
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

		const { result, background: pasted } = parseLook(source);
		const theme = result.theme;
		if (!theme) return;

		if (theme.name !== sessionName) {
			replaced = customThemes.some((t) => t.name === theme.name) ? theme.name : null;
			sessionName = theme.name;
		}

		storeCustomThemes([...customThemes.filter((t) => t.name !== theme.name), theme]);
		setTheme(themeId(theme.name));
		currentTheme = themeId(theme.name);

		// Only on a new SVG, so typing in the box doesn't undo tweaks made since the paste.
		if (pasted?.svg && background?.svg !== pasted.svg) {
			storeBackground(pastedBackground(pasted.svg));
		}
	};

	const handleCreate = () => {
		source = '';
		sessionName = null;
		replaced = null;
		openSheet('create');
	};

	const handleEditCustom = (theme: CustomTheme) => {
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
		mounted = true;
	});
</script>

<button
	bind:this={trigger}
	class="btn m-1 uppercase btn-accent"
	aria-expanded={open}
	aria-controls="theme-sheet"
	on:click={() => (open ? closeSheet() : openSheet('look'))}><slot></slot></button
>

{#if open}
	<Sheet
		bind:this={sheet}
		id="theme-sheet"
		title={view === 'create' ? 'Create a theme' : 'Theme'}
		showFooter={view === 'look'}
		on:close={closeSheet}
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
					<button class="btn w-full" on:click={handleCreate}>
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
					on:change={(e) => storeBackground(e.detail)}
				/>
			</div>
		{:else}
			<div class="flex flex-col gap-6">
				<p>
					One prompt gets you colors and a matching background. Paste the reply and both apply right
					away.
				</p>

				<label class="flex flex-col gap-1">
					<span class="font-semibold">Describe the look</span>
					<input
						bind:this={describeEl}
						bind:value={description}
						class="input w-full"
						placeholder={DESCRIBE_PLACEHOLDER}
					/>
				</label>

				<div class="flex flex-col gap-2">
					<span class="font-semibold">Ask an AI</span>
					<div class="flex flex-wrap items-center gap-3">
						<CopyButton text={lookPrompt(description)} label="Copy prompt" />
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
						class:textarea-error={result.errors.length > 0}
						wrap="off"
						spellcheck="false"
						placeholder={'@plugin "daisyui/theme" { … }\n<svg viewBox="0 0 48 48">…</svg>'}
					></textarea>
					<span class="text-sm opacity-75">
						Extra text is ignored. A daisyUI theme on its own works too, from the
						<a
							class="link"
							href="https://daisyui.com/theme-generator/"
							target="_blank"
							rel="noreferrer">theme generator</a
						>.
					</span>
				</label>

				{#if source.trim() !== ''}
					<div
						role="status"
						class="alert flex flex-col items-start gap-1 alert-soft"
						class:alert-success={result.theme}
						class:alert-error={!result.theme}
					>
						{#if result.theme}
							<span class="font-semibold">Applied “{result.theme.name}”</span>
							{#if replaced === result.theme.name}
								<span>Replaced your earlier “{result.theme.name}” theme.</span>
							{:else}
								<span>Saved to your themes.</span>
							{/if}
							{#if pasted?.svg}
								<span>Background applied too.</span>
							{/if}
						{:else}
							<span class="font-semibold">
								Not applied: {result.errors.length}
								{result.errors.length === 1 ? 'problem' : 'problems'}
							</span>
							<ul class="list-disc pl-5">
								{#each result.errors as error (error)}
									<li>{error}</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}

				{#if pasted && !pasted.svg}
					<div class="text-sm">
						<p class="font-semibold">Background skipped</p>
						<ul class="list-disc pl-5">
							{#each pasted.errors as error (error)}
								<li>{error}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if result.warnings.length > 0}
					<ul class="list-disc pl-5 text-sm opacity-75">
						{#each result.warnings as warning (warning)}
							<li>{warning}</li>
						{/each}
					</ul>
				{/if}

				{#if result.theme}
					<button class="btn self-start btn-neutral" on:click={showLook}>Done</button>
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
