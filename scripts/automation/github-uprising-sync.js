// ============================================================
// Project: Uprising CRM
// Author: Uprising Studio
// Description: github-uprising-sync.js
// Last Modified: 2026-03-04
// ============================================================

/* eslint-disable no-console */
import 'dotenv/config';
import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!GITHUB_TOKEN || !TWENTY_API_URL || !TWENTY_API_KEY) {
  console.error('❌ Missing GITHUB_TOKEN, TWENTY_API_URL, or TWENTY_API_KEY in .env');
  process.exit(1);
}

async function fetchGithubRepos() {
  console.log('🔍 Fetching GitHub projects...');
  const response = await fetch('https://api.github.com/user/repos?per_page=100', {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const repos = await response.json();
  const uprisingRepos = repos.filter(repo => repo.name.toLowerCase().includes('uprising'));
  console.log(`✅ Found ${uprisingRepos.length} Uprising projects on GitHub.`);
  return uprisingRepos;
}

async function upsertProjectToTwenty(repo) {
  const query = `
    mutation UpsertOpportunity($data: OpportunityCreateInput!) {
      createOpportunity(data: $data) {
        id
        name
      }
    }
  `;

  const variables = {
    data: {
      name: repo.name,
      // You can add more mapping here
    }
  };

  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to sync ${repo.name}: ${errorText}`);
    return;
  }

  console.log(`✨ Synced: ${repo.name}`);
}

async function main() {
  try {
    const repos = await fetchGithubRepos();
    for (const repo of repos) {
      await upsertProjectToTwenty(repo);
      // Small delay to be nice
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    console.log('\n📊 Sync complete!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

main();
