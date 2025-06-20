<script lang="ts">
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';
	import { timeAgo } from '$lib/github';
	import { getContrastColor, getRiskColor } from '$lib/utils/color';
	import SvelteMarkdown from 'svelte-markdown';
	import Card from './ui/card/card.svelte';
	import { SparkleIcon } from '@lucide/svelte';
	import { getChatResponse, getChatResponseStreamed } from '$lib/openai';
	import { onMount } from 'svelte';
	import { type Writable } from 'svelte/store';
	import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { responseBodyFromJSON } from '@mistralai/mistralai/models/operations';
	import * as Diff2Html from 'diff2html';
	import 'diff2html/bundles/css/diff2html.min.css';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { mode } from 'mode-watcher';

	export let pr: SearchIssue;
	export let repoFullName: string;

	let aiSummary = '';
	let aiRisk = -1;
	let aiComplexity = -1;
	let aiSeniority = -1;
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
		console.log(pr);
		if (pr.pull_request?.diff_url) {
			prDiff = await fetchDiff(pr.pull_request.diff_url);
		}

		const [summary, riskResponse, complexityResponse, seniorityResponse] = await Promise.all([
			getChatResponse([
				{
					role: 'user',
					content: `Your task is to summarize the following GitHub pull request for a developer:

Title: ${pr.title}

Body: ${pr.body || ''}

${prDiff ? 'Diff: ' + prDiff : ''}

You must only respond with the short summary (maximum 2-3 sentences), no other text, introduction or explanation. Use markdown formatting where appropriate.`
				}
			]),
			getChatResponse([
				{
					role: 'user',
					content: `Your task is to assess the risk level of the following GitHub pull request and provide a single integer number between 0 and 10:

Title: ${pr.title}

Body: ${pr.body || ''}

${prDiff ? 'Diff: ' + prDiff : ''}

You must only respond with the number, no other text, introduction or explanation.`
				}
			]),
			getChatResponse([
				{
					role: 'user',
					content: `Your task is to assess the complexity level of the following GitHub pull request and provide a single integer number between 0 and 10:

Title: ${pr.title}

Body: ${pr.body || ''}

${prDiff ? 'Diff: ' + prDiff : ''}

You must only respond with the number, no other text, introduction or explanation.`
				}
			]),
			getChatResponse([
				{
					role: 'user',
					content: `Your task is to assess the level experience required of the following GitHub pull request and provide a single integer number between 0 and 100, where 0 is a new junior developer and 100 is a senior developer:

Title: ${pr.title}

Body: ${pr.body || ''}

${prDiff ? 'Diff: ' + prDiff : ''}

You must only respond with the number, no other text, introduction or explanation.`
				}
			])
		]);

		aiSummary = summary as string;

		let riskNum = parseInt(riskResponse as string);
		if (isNaN(riskNum) || riskNum < 0 || riskNum > 10) {
			riskNum = 5;
		}
		aiRisk = riskNum;

		let complexityNum = parseInt(complexityResponse as string);
		if (isNaN(complexityNum) || complexityNum < 0 || complexityNum > 10) {
			complexityNum = 5;
		}
		aiComplexity = complexityNum;

		let seniorityNum = parseInt(seniorityResponse as string);
		if (isNaN(seniorityNum) || seniorityNum < 0 || seniorityNum > 100) {
			seniorityNum = 50;
		}
		aiSeniority = seniorityNum;
	});
</script>

<ScrollArea class="flex h-0 w-full flex-grow">
	<div class="mx-auto flex max-w-6xl min-w-3xl flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-1">
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
				<div class="inline-block font-semibold"><SvelteMarkdown source={pr.title ?? ''} /></div>
				<span class="ml-2 text-xs text-gray-500">{pr.created_at ? timeAgo(pr.created_at) : ''}</span
				>
				<div class="flex-grow"></div>
				{#if pr.user}
					<button
						class="flex cursor-pointer flex-row items-center gap-2 text-sm"
						onclick={() =>
							window.open(`https://github.com/${pr.user!.login}`, '_blank', 'noopener')}
					>
						<div>{pr.user.login}</div>
						<img src={pr.user.avatar_url} alt="Avatar" class="h-6 w-6 rounded-full" />
					</button>
				{/if}
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
		<div class="flex flex-row gap-4">
			<Card class="flex min-h-16 flex-grow gap-2 p-4 shadow">
				<div class="flex min-h-12 items-center gap-2">
					<h2 class="text-xl font-bold">AI Assessment</h2>
					{#if !aiSummary}
						<div class="flex animate-pulse flex-row items-center justify-center text-gray-500">
							<SparkleIcon size={16} class="mr-2" />
							<p class="italic">Generating...</p>
						</div>
					{/if}
					{#if aiRisk != -1}
						<span
							class="rounded border px-2 py-0.5 text-xs font-semibold"
							style="background-color: {getRiskColor(aiRisk)}cc; color: {getContrastColor(
								getRiskColor(aiRisk) + 'cc'
							)}; border-color: {getRiskColor(aiRisk)}33;"
						>
							Risk: {aiRisk} / 10
						</span>
					{/if}
					{#if aiComplexity != -1}
						<span
							class="rounded border px-2 py-0.5 text-xs font-semibold"
							style="background-color: {getRiskColor(aiComplexity)}cc; color: {getContrastColor(
								getRiskColor(aiComplexity) + 'cc'
							)}; border-color: {getRiskColor(aiComplexity)}33;"
						>
							Complexity: {aiComplexity} / 10
						</span>
					{/if}
					{#if aiSeniority != -1}
						<div class="flex flex-grow flex-row items-center gap-2 p-2 text-gray-500">
							<div>Junior</div>
							<Slider
								disabled
								type="single"
								value={aiSeniority}
								max={100}
								step={1}
								class="flex-grow"
							/>
							<div>Senior</div>
						</div>
					{/if}
				</div>
				{#if aiSummary}
					<SvelteMarkdown source={aiSummary ?? ''} />
				{/if}
			</Card>
			{#if pr.user}
				<Card class="flex w-100 max-w-100 min-w-100 flex-shrink gap-2 p-0 shadow">
					<div class="flex flex-row items-center px-4 pt-4">
						<div class="flex min-h-12 flex-row items-center text-xl font-bold">Author Rank</div>
					</div>
					<img
						alt="User stats"
						class="w-full rounded-xl"
						src={`https://github-readme-stats.vercel.app/api?username=${pr.user!.login}${mode.current != 'light' ? '&theme=github_dark' : ''}&hide_border=true&hide_title=true&bg_color=00000000&show_icons=true`}
					/>
				</Card>
			{/if}
		</div>
		<div class="p-4">
			<div class="flex flex-row items-center">
				<div class="flex min-h-12 flex-row items-center text-xl font-bold">Description</div>
			</div>
			<p class="text-sm [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400">
				<SvelteMarkdown source={pr.body ?? ''} />
			</p>
		</div>
		{#if prDiff}
			<Card class="max-h-200 min-h-16 shadow">
				<ScrollArea class="max-size-full size-full overflow-y-scroll">
					<div class="px-4">
						{@html Diff2Html.html(prDiff, {
							drawFileList: true,
							matching: 'lines',
							outputFormat: 'side-by-side',
							// @ts-expect-error idc
							colorScheme: mode.current
						})}
					</div>
				</ScrollArea>
			</Card>
		{/if}
	</div>
</ScrollArea>
