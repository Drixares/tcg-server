import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const API_BASE_URL = "https://apitcg.com/api/one-piece/cards";
const API_KEY = process.env.TCG_API_KEY;
const LIMIT = 100;
const DATA_DIR = join(import.meta.dir, "..", "data");

interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: unknown[];
}

async function fetchPage(page: number): Promise<ApiResponse> {
  const url = `${API_BASE_URL}?page=${page}&limit=${LIMIT}`;
  console.log(`Fetching page ${page}...`);

  const response = await fetch(url, {
    headers: {
      "x-api-key": API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  if (!API_KEY) {
    console.error("Error: TCG_API_KEY environment variable is not set");
    console.error("Please set it in your .env file");
    process.exit(1);
  }

  await mkdir(DATA_DIR, { recursive: true });

  const firstPage = await fetchPage(1);
  const { total, totalPages } = firstPage;
  console.log(`Total cards: ${total}, Total pages: ${totalPages}`);

  const allCards: unknown[] = [...firstPage.data];

  for (let page = 2; page <= totalPages; page++) {
    const response = await fetchPage(page);
    allCards.push(...response.data);

    // Small delay to be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`Fetched ${allCards.length} cards total`);

  // Save all cards to a single JSON file
  const outputPath = join(DATA_DIR, "all-cards.json");
  await writeFile(outputPath, JSON.stringify(allCards, null, 2));
  console.log(`Saved all cards to ${outputPath}`);

  // Also save paginated files for backup
  const pagesDir = join(DATA_DIR, "pages");
  await mkdir(pagesDir, { recursive: true });

  for (let i = 0; i < totalPages; i++) {
    const pageCards = allCards.slice(i * LIMIT, (i + 1) * LIMIT);
    const pagePath = join(pagesDir, `page-${i + 1}.json`);
    await writeFile(pagePath, JSON.stringify(pageCards, null, 2));
  }
  console.log(`Saved ${totalPages} page files to ${pagesDir}`);
}

main().catch(console.error);
