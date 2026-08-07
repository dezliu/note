// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import profileConfig from './profile.config';

// https://astro.build/config
export default defineConfig({
	site: 'https://dezliu.github.io',
	base: '/note',
	integrations: [mdx(), sitemap()],

	vite: {
		plugins: [tailwindcss()],
	},
});