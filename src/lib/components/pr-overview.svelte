<script lang="ts">
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';
	import { timeAgo } from '$lib/github';
	import { getContrastColor } from '$lib/utils/color';
	import SvelteMarkdown from 'svelte-markdown';
	import Card from './ui/card/card.svelte';
	import { SparkleIcon } from '@lucide/svelte';
	import { getChatResponse, getChatResponseStreamed } from '$lib/openai';
	import { onMount } from 'svelte';
	import { type Writable } from 'svelte/store';
	import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { responseBodyFromJSON } from '@mistralai/mistralai/models/operations';
	// @ts-expect-error idc
	import * as Diff2Html from 'diff2html';
	import 'diff2html/bundles/css/diff2html.min.css';

	export let pr: SearchIssue;
	export let repoFullName: string;

	let aiSummary = '';
	let aiSummaryStore: Writable<string>;
	let prDiff = '';

	async function fetchDiff(url: string): Promise<string> {
		const res = await fetch('https://corsproxy.io/?url=' + url);
		if (!res.ok) return '';
		const text = await res.text();
		console.log(text);
		return text;
	}

	onMount(async () => {
		if (pr.pull_request?.diff_url) {
			prDiff = await fetchDiff(pr.pull_request.diff_url);
		}
		aiSummary = (await getChatResponse([
			{
				role: 'user',
				content: `Your task is to summarize the following GitHub pull request in a maximum of 2-3 sentences for a developer:

Title: ${pr.title}

Body: ${pr.body || ''}

${prDiff ? 'Diff: ' + prDiff : ''}

You must only respond with the summary, no other text, introduction or explanation.`
			}
		])) as string;
	});
</script>

<ScrollArea class="flex h-0 w-full flex-grow">
	<div class="mx-auto flex max-w-6xl min-w-3xl flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<div>
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
				<div class="inline-block font-semibold"><SvelteMarkdown source={pr.title} /></div>
				<span class="ml-2 text-xs text-gray-500">{pr.created_at ? timeAgo(pr.created_at) : ''}</span
				>
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
		<Card class="flex min-h-16 p-4 shadow">
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
		{#if prDiff}
			<Card class="max-h-200 min-h-16 bg-white p-4 text-black shadow">
				<ScrollArea class="max-size-full size-full overflow-y-scroll">
					<div>
						{@html Diff2Html.html(prDiff, {
							drawFileList: true,
							matching: 'lines',
							outputFormat: 'side-by-side'
						})}
					</div>
				</ScrollArea>
			</Card>
		{/if}
	</div>
</ScrollArea>
