import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { workflowPlugin } from 'workflow/sveltekit';
import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({ plugins: [workflowPlugin(), sveltekit({
  preprocess: vitePreprocess(),
  adapter: vercel(),
})] });
