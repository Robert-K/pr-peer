<script lang="ts">
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';
	import { timeAgo } from '$lib/github';
	import { getContrastColor } from '$lib/utils/color';
	import SvelteMarkdown from 'svelte-markdown';
	import Card from './ui/card/card.svelte';
	import { SparkleIcon } from '@lucide/svelte';
	import { getChatResponseStreamed } from '$lib/openai';
	import { onMount } from 'svelte';
	import { type Writable } from 'svelte/store';
	import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

	export let pr: SearchIssue;
	export let repoFullName: string;

	let aiSummary = '';
	let aiSummaryStore: Writable<string>;

	onMount(() => {
		const prompt: ChatCompletionMessageParam = {
			role: 'system',
			content: `Your task is to summarize the following GitHub pull request in a maximum of 2-3 sentences for a developer:

Title: ${pr.title}

Body: ${pr.body || ''}`
		};
		aiSummaryStore = getChatResponseStreamed([prompt]);
		aiSummaryStore.subscribe((val: string) => {
			aiSummary = val;
		});
	});
</script>

<div class="flex min-w-3xl flex-col gap-4 p-4">
	<div class="flex flex-col gap-1">
		<div>
			<Button
				class="h-6 font-mono font-bold hover:underline"
				variant="secondary"
				size="sm"
				onclick={(e) => {
					e.stopPropagation();
					window.open(`https://github.com/${repoFullName}/pull/${pr.number}`, '_blank', 'noopener');
				}}
			>
				#{pr.number}
			</Button>
			<div class="inline-block font-semibold"><SvelteMarkdown source={pr.title} /></div>
			<span class="ml-2 text-xs text-gray-500">{pr.created_at ? timeAgo(pr.created_at) : ''}</span>
		</div>
		{#if pr.labels && pr.labels.length > 0}
			<div class="mt-2 flex flex-wrap gap-1">
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
			</div>
		{/if}
	</div>
	<Card class="flex min-h-24 p-4">
		{#if aiSummary}
			<SvelteMarkdown source={aiSummary} />
		{:else}
			<div class="flex flex-grow animate-pulse items-center justify-center text-gray-500">
				<SparkleIcon size={16} class="mr-2" />
				<p class="italic">Generating summary...</p>
			</div>
		{/if}
	</Card>
	<p class="text-sm [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400">
		<SvelteMarkdown source={pr.body} />
	</p>
</div>
