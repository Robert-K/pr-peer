<script context="module" lang="ts">
	import type { Endpoints } from '@octokit/types';

	export type RepoSuggestion = Pick<
		Endpoints['GET /search/repositories']['response']['data']['items'][0],
		'full_name' | 'description'
	>;
</script>

<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { Octokit } from '@octokit/rest';

	export let selectedRepo: RepoSuggestion | null = null;
	let query = '';
	let suggestions: RepoSuggestion[] = [];
	let loading = false;

	const token = import.meta.env.VITE_GITHUB_TOKEN;
	const octokit = token ? new Octokit({ auth: token }) : new Octokit();

	async function searchRepos(q: string) {
		if (!q) {
			suggestions = [];
			return;
		}
		loading = true;
		try {
			const res = await octokit.search.repos({ q, per_page: 5 });
			suggestions = res.data.items.map((repo) => ({
				full_name: repo.full_name,
				description: repo.description || ''
			}));
		} catch (e) {
			suggestions = [];
		} finally {
			loading = false;
		}
	}

	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleCommandInput(val: string) {
		query = val;
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			searchRepos(query);
		}, 200);
	}

	function selectRepo(repo: RepoSuggestion) {
		selectedRepo = repo;
		query = repo.full_name;
		suggestions = [];
	}
</script>

<div class="w-2xl">
	<Command.Root class="min-w-full rounded-lg border shadow-md" shouldFilter={false}>
		<Command.Input
			placeholder="Search for a repository..."
			bind:value={query}
			oninput={(e) => handleCommandInput((e.target as HTMLInputElement).value)}
		/>
		{#if query !== selectedRepo?.full_name}
			<Command.List>
				{#if !loading && suggestions.length === 0 && query}
					<Command.Empty>No results found.</Command.Empty>
				{:else if suggestions.length > 0}
					<Command.Group heading="Repositories">
						{#each suggestions as repo}
							<Command.Item class="gap-4" onSelect={() => selectRepo(repo)}>
								<div class="font-bold text-nowrap">{repo.full_name}</div>
								{#if repo.description}
									<div class="text-xs text-gray-500">
										{repo.description.length > 80
											? `${repo.description.slice(0, 77)}...`
											: repo.description}
									</div>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			</Command.List>
		{/if}
	</Command.Root>
	{#if selectedRepo}
		<div class="mt-4 rounded border bg-gray-50 p-3 dark:bg-gray-900">
			<strong>Selected:</strong>
			{selectedRepo.full_name}
			{#if selectedRepo.description}
				<div class="text-xs text-gray-500">{selectedRepo.description}</div>
			{/if}
		</div>
	{/if}
</div>
