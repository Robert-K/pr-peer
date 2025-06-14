import { Octokit } from '@octokit/rest';
import type { Endpoints } from '@octokit/types';

const token = import.meta.env.VITE_GITHUB_TOKEN;
const octokit = token ? new Octokit({ auth: token }) : new Octokit();

export type RepoSuggestion = Pick<
	Endpoints['GET /search/repositories']['response']['data']['items'][0],
	'full_name' | 'description'
>;

export async function searchRepos(q: string, per_page = 5): Promise<RepoSuggestion[]> {
	if (!q) return [];
	const res = await octokit.search.repos({ q, per_page });
	return res.data.items.map((repo) => ({
		full_name: repo.full_name,
		description: repo.description || ''
	}));
}
