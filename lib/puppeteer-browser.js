import puppeteer from "puppeteer";

let browserInstance = null;

/**
 * Returns a shared Puppeteer browser instance. Reused across PDF requests to avoid
 * launching Chromium on every call. On EC2/PM2 the process is long-lived so this works well.
 */
export async function getBrowser() {
    if (browserInstance && browserInstance.connected) {
        return browserInstance;
    }
    browserInstance = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
        ],
    });
    browserInstance.on("disconnected", () => {
        browserInstance = null;
    });
    return browserInstance;
}
