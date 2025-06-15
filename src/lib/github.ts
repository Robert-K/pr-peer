import { Octokit } from '@octokit/rest';
import type { Endpoints } from '@octokit/types';

export type Repo = Endpoints['GET /search/repositories']['response']['data']['items'][0];
export type SearchIssue = Endpoints['GET /search/issues']['response']['data']['items'][0];

const token = import.meta.env.VITE_GITHUB_TOKEN;
export const octokit = token ? new Octokit({ auth: token }) : new Octokit();

export async function searchRepos(q: string, per_page = 5): Promise<Repo[]> {
	if (!q) return [];
	const res = await octokit.search.repos({ q, per_page });
	return res.data.items;
}

export async function searchPullRequests(repoFullName: string, q: string): Promise<SearchIssue[]> {
	if (!repoFullName) return [];
	const searchQuery = [
		`repo:${repoFullName}`,
		'is:pr',
		// 'is:open',
		q ? q : ''
	].filter(Boolean).join(' ');

	const res = await octokit.request('GET /search/issues', {
		q: searchQuery
	});
	return res.data.items;
}

export function timeAgo(dateString: string): string {
	const now = new Date();
	const date = new Date(dateString);
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
		{ label: 'second', seconds: 1 }
	];
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
		}
	}
	return 'just now';
}
