<script lang="ts">
	import { getChatResponse } from '$lib/openai';
	import { getContrastColor } from '$lib/utils/color';
	import { onMount } from 'svelte';
	let { pr } = $props();

	let predicted_label = $state<number | null>(null);
	let loading = $state(false);

	// Function to calculate color based on risk level (1-10)
	// Blue for low risk, red for high risk
	function getRiskColor(value: number): string {
		// Ensure value is between 1 and 10
		const normalizedValue = Math.max(1, Math.min(10, value));

		// Calculate the ratio (0 = low risk/blue, 1 = high risk/red)
		const ratio = (normalizedValue - 1) / 9;

		// RGB components
		const r = Math.round(0 + ratio * 255);
		const g = Math.round(0 + (1 - ratio) * 128);
		const b = Math.round(255 - ratio * 255);

		// Return hex color
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
			.toString(16)
			.padStart(2, '0')}`;
	}

	onMount(async () => {
		loading = true;
		try {
			const response = await getChatResponse([
				{
					role: 'user',
					content: `How high is the risk and impact of this PR with title "${pr.title}" and body text "${pr.body}"? Please respond with a single number between 1 and 10. Lower numbers closer to 1 should indicate lower risk, higher numbers indicate higher risk. Respond only with the number, give no additional context.`
				}
			]);
			// Parse the response as a number and validate it
			const parsedValue = response ? parseInt(response.trim(), 10) : NaN;
			predicted_label =
				!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 10 ? parsedValue : 5;
		} catch (e) {
			predicted_label = null;
		} finally {
			loading = false;
		}
	});
</script>

<div>
	{#if predicted_label}
		<span
			class="rounded border px-2 py-0.5 text-xs font-semibold"
			style="background-color: {getRiskColor(predicted_label)}cc; color: {getContrastColor(
				getRiskColor(predicted_label) + 'cc'
			) ?? '#3710ff'}; border-color: {getRiskColor(predicted_label)}33;"
		>
			{predicted_label}
		</span>
	{/if}
</div>
