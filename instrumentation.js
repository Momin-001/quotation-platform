import { startCronJobs } from "@/lib/cron-jobs";

export function register() {
  startCronJobs();
  console.log("Server started, cron loaded");
}