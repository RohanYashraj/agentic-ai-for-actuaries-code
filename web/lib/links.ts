export const GITHUB_REPO =
  "https://github.com/RohanYashraj/agentic-ai-for-actuaries-code";

export function colabUrl(chapter: string): string {
  return `https://colab.research.google.com/github/RohanYashraj/agentic-ai-for-actuaries-code/blob/main/notebooks/${chapter}.ipynb`;
}

export function githubFileUrl(repoPath: string): string {
  return `${GITHUB_REPO}/blob/main/${repoPath}`;
}
