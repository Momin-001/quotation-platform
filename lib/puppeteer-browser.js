/**
 * Puppeteer browser utility.
 *
 * STRATEGY: Launch-on-demand, close-after-use.
 *
 * WHY NOT a persistent singleton?
 * Keeping Chromium alive 24/7 costs ~150-200MB even with zero users.
 * For a quotation platform where PDFs are generated infrequently (not
 * hundreds per minute), the ~1-2s cold-start per request is an acceptable
 * trade-off to keep the server footprint small.
 *
 * CONCURRENCY: A simple mutex prevents two simultaneous requests from
 * each spawning their own Chromium instance. The second request waits
 * for the first to finish, then launches its own short-lived instance.
 */

import puppeteer from "puppeteer";

/** How long (ms) we allow a single PDF generation to take before aborting. */
const PDF_TIMEOUT_MS = 30_000;

/**
 * Primitive async mutex. Ensures only one Chromium instance is active
 * at a time, preventing memory spikes under concurrent requests.
 */
class Mutex {
    constructor() {
        this._queue = [];
        this._locked = false;
    }

    acquire() {
        return new Promise((resolve) => {
            if (!this._locked) {
                this._locked = true;
                resolve();
            } else {
                this._queue.push(resolve);
            }
        });
    }

    release() {
        if (this._queue.length > 0) {
            const next = this._queue.shift();
            next();
        } else {
            this._locked = false;
        }
    }
}

const mutex = new Mutex();

/**
 * Launches a fresh Chromium instance, runs `task(page)`, then closes
 * the browser — regardless of success or failure.
 *
 * @param {(page: import('puppeteer').Page) => Promise<T>} task
 * @returns {Promise<T>}
 * @template T
 */
export async function withBrowserPage(task) {
    await mutex.acquire();

    let browser = null;
    let page = null;

    // Wrap everything in a single timeout so a hung Chromium can't block
    // the server indefinitely.
    const timeoutHandle = setTimeout(() => {
        browser?.close().catch(() => {});
    }, PDF_TIMEOUT_MS);

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",              // Not needed on a headless server
                "--disable-extensions",       // Cuts launch time & memory
                "--single-process",           // Reduces per-instance overhead
                                              // (safe for server-side PDF use)
            ],
        });

        page = await browser.newPage();

        // Abort loading of images/fonts/stylesheets fetched from the network —
        // our HTML is self-contained, so this is safe and speeds up rendering.
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const type = req.resourceType();
            if (["image", "stylesheet", "font", "media"].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return await task(page);
    } finally {
        clearTimeout(timeoutHandle);
        // Always clean up, even if task threw
        page?.close().catch(() => {});
        browser?.close().catch(() => {});
        mutex.release();
    }
}