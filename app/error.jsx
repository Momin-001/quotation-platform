"use client";

import { useEffect } from "react";
import StatusPageShell from "@/components/guest/StatusPageShell";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return <StatusPageShell variant="error" onRetry={reset} />;
}
