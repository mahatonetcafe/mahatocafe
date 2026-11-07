// Stores files in a private GitHub repository through the Contents API.

const api = () => process.env.GITHUB_API_URL || "https://api.github.com";
const repo = () => process.env.GITHUB_REPO ?? "";
const branch = () => process.env.GITHUB_BRANCH || "main";

export class GithubError extends Error {}
class Conflict extends GithubError {}

function failed(what: string, status: number) {
  const message = `${what} failed with HTTP ${status}`;
  return status === 409 ? new Conflict(message) : new GithubError(message);
}

export function githubConfigured() {
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

function headers(accept = "application/vnd.github+json") {
  return {
    Accept: accept,
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mahato-net-cafe", // GitHub rejects requests without one, and Workers send none
    "Content-Type": "application/json",
  };
}

const contentsUrl = (path: string) =>
  `${api()}/repos/${repo()}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;

// Commits to one branch must not overlap, or GitHub rejects the later one with a 409.
// Worker instances can't coordinate, so writes one by one here and retry a clash.
let writes: Promise<unknown> = Promise.resolve();
function inOrder<T>(job: () => Promise<T>): Promise<T> {
  const attempt = async () => {
    for (let tries = 1; ; tries++) {
      try {
        return await job();
      } catch (e) {
        if (!(e instanceof Conflict) || tries === 4) throw e;
        await new Promise((resolve) => setTimeout(resolve, 400 * tries));
      }
    }
  };
  const run = writes.then(attempt, attempt);
  writes = run.catch(() => undefined);
  return run;
}

let privateCheckedAt = 0;
const PRIVATE_CHECK_MS = 10 * 60 * 1000;

/** Customer documents must never reach a public repository. */
async function assertPrivateRepo() {
  if (Date.now() - privateCheckedAt < PRIVATE_CHECK_MS) return;
  const res = await fetch(`${api()}/repos/${repo()}`, { headers: headers() });
  if (!res.ok) throw new GithubError(`Repo check failed with HTTP ${res.status}`);
  const body = (await res.json()) as { private?: boolean };
  if (body.private !== true) throw new GithubError("Repository is not private");
  privateCheckedAt = Date.now();
}

export async function githubStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!githubConfigured()) return { ok: false, detail: "GitHub connected nahi hai. Bina iske files upload nahi hongi." };
  try {
    privateCheckedAt = 0;
    await assertPrivateRepo();
    return { ok: true, detail: `GitHub connected hai: ${repo()} (private)` };
  } catch (e) {
    return { ok: false, detail: `GitHub me dikkat: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

/** Returns the blob sha, which is needed to delete the file later. */
export function putFile(path: string, data: Buffer, message: string): Promise<string> {
  return inOrder(async () => {
    await assertPrivateRepo();
    const res = await fetch(contentsUrl(path), {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ message, content: data.toString("base64"), branch: branch() }),
    });
    if (!res.ok) throw failed("Upload", res.status);
    const body = (await res.json()) as { content: { sha: string } };
    return body.content.sha;
  });
}

export async function getFile(path: string): Promise<Buffer> {
  const res = await fetch(`${contentsUrl(path)}?ref=${encodeURIComponent(branch())}`, {
    headers: headers("application/vnd.github.raw+json"),
  });
  if (!res.ok) throw new GithubError(`Download failed with HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** A file that is already gone counts as deleted. */
export function deleteFile(path: string, sha: string, message: string): Promise<void> {
  return inOrder(async () => {
    const res = await fetch(contentsUrl(path), {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ message, sha, branch: branch() }),
    });
    if (!res.ok && res.status !== 404) throw failed("Delete", res.status);
  });
}
