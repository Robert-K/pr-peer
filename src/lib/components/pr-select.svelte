<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { searchPullRequests, type SearchIssue, timeAgo } from '$lib/github';
	import { onMount } from 'svelte';
	import Button from './ui/button/button.svelte';

	export let repoFullName: string = '';
	export let selectedPr: SearchIssue | null = null;
	export let onSelect: (pr: SearchIssue) => void = () => {};
	let query = '';
	let suggestions: SearchIssue[] = [];
	let loading = false;

	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	function getContrastColor(hex: string) {
		// Remove hash if present
		hex = hex.replace('#', '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((x) => x + x)
				.join('');
		}
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.6 ? '#222' : '#fff';
	}

	onMount(async () => {
		if (repoFullName) {
			loading = true;
			try {
				suggestions = await searchPullRequests(repoFullName, '');
			} catch (e) {
				suggestions = [];
			} finally {
				loading = false;
			}
		}
	});

	async function handleCommandInput(e: Event) {
		let val = (e.target as HTMLInputElement).value;
		query = val;
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			if (!repoFullName) {
				suggestions = [];
				return;
			}
			loading = true;
			try {
				suggestions = await searchPullRequests(repoFullName, query);
			} catch (e) {
				suggestions = [];
			} finally {
				loading = false;
			}
		}, 200);
	}

	function selectPr(pr: SearchIssue) {
		onSelect(pr);
		selectedPr = pr;
	}
</script>

<Command.Root
	class="flex h-0 min-h-0 flex-shrink flex-grow rounded-lg border shadow-md"
	shouldFilter={false}
>
	<Command.Input
		placeholder="Search for a pull request..."
		bind:value={query}
		oninput={(e) => handleCommandInput(e)}
		autofocus
	/>
	<Command.List class="max-h-auto min-h-0 flex-shrink overflow-x-hidden">
		{#if !loading && suggestions.length === 0 && query}
			<Command.Empty>No results found.</Command.Empty>
		{:else if suggestions.length > 0}
			<Command.Group heading="Pull Requests">
				{#each suggestions as pr}
					<Command.Item class="flex flex-col items-start" onSelect={() => selectPr(pr)}>
						<div class="flex flex-wrap items-center gap-2">
							<Button
								class="h-6 font-mono font-bold hover:underline"
								variant="secondary"
								size="sm"
								onclick={(e) => {
									e.stopPropagation();
									window.open(
										`https://github.com/${repoFullName}/pull/${pr.number}`,
										'_blank',
										'noopener'
									);
								}}
							>
								#{pr.number}
							</Button>
							<span class="font-semibold">{pr.title}</span>
						</div>
						<div class="gap-2">
							{#if pr.labels && pr.labels.length > 0}
								<span class="flex flex-wrap gap-1">
									{#each pr.labels as label}
										<span
											class="rounded border px-2 py-0.5 text-xs font-semibold"
											style="background-color: #{label.color}cc; color: {getContrastColor(
												label.color ?? '#3710ff'
											)}; border-color: #{label.color}33;"
										>
											{label.name}
										</span>
									{/each}
								</span>
							{/if}
						</div>
						{#if pr.body}
							<div class="mt-1 line-clamp-2 text-xs text-gray-500">
								{pr.body.length > 150 ? `${pr.body.slice(0, 147)}...` : pr.body}
							</div>
						{/if}
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Root>
{#if selectedPr}
	<div class="mt-4 rounded border bg-gray-50 p-3 dark:bg-gray-900">
		<strong>Selected PR:</strong>
		#{selectedPr.number}
		{selectedPr.title}
		{#if selectedPr.body}
			<div class="text-xs text-gray-500">{selectedPr.body}</div>
		{/if}
	</div>
{/if}
