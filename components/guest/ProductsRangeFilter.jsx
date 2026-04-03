"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
}

function parseDecimalInput(s, fallback) {
    const n = parseFloat(String(s).replace(",", "."));
    return Number.isNaN(n) ? fallback : n;
}

function parseIntInput(s, fallback) {
    const n = parseInt(String(s).trim(), 10);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Dual-thumb range: two inputs + slider. `integer` uses whole steps; otherwise 2 dp decimals.
 */
export function ProductsRangeFilter({
    label,
    unit,
    boundMin,
    boundMax,
    step,
    integer = false,
    value,
    onChange,
    disabled,
    className,
}) {
    const bMin = Number(boundMin);
    const bMax = Number(boundMax);
    const safe = (n) => clamp(n, bMin, bMax);

    const loNum = safe(
        integer ? parseIntInput(value.min, bMin) : parseDecimalInput(value.min, bMin)
    );
    const hiNum = safe(
        integer ? parseIntInput(value.max, bMax) : parseDecimalInput(value.max, bMax)
    );
    const lo = Math.min(loNum, hiNum);
    const hi = Math.max(loNum, hiNum);

    const formatOut = (n) => (integer ? String(Math.round(n)) : n.toFixed(2));

    const handleSlider = (pair) => {
        const a = safe(integer ? Math.round(pair[0]) : pair[0]);
        const b = safe(integer ? Math.round(pair[1]) : pair[1]);
        const x = Math.min(a, b);
        const y = Math.max(a, b);
        onChange({ min: formatOut(x), max: formatOut(y) });
    };

    const onBlurMin = () => {
        let n = integer ? parseIntInput(value.min, bMin) : parseDecimalInput(value.min, bMin);
        n = safe(n);
        const maxN = integer ? parseIntInput(value.max, bMax) : parseDecimalInput(value.max, bMax);
        const maxSafe = safe(maxN);
        if (n > maxSafe) n = maxSafe;
        onChange({ min: formatOut(n), max: value.max });
    };

    const onBlurMax = () => {
        let n = integer ? parseIntInput(value.max, bMax) : parseDecimalInput(value.max, bMax);
        n = safe(n);
        const minN = integer ? parseIntInput(value.min, bMin) : parseDecimalInput(value.min, bMin);
        const minSafe = safe(minN);
        if (n < minSafe) n = minSafe;
        onChange({ min: value.min, max: formatOut(n) });
    };

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-md font-open-sans font-normal mb-1 block">{label}</label>
            <div className="flex items-center gap-2 flex-wrap">
                <Input
                    type="text"
                    inputMode={integer ? "numeric" : "decimal"}
                    className="w-24 min-w-0"
                    value={value.min}
                    disabled={disabled}
                    onChange={(e) => onChange({ min: e.target.value, max: value.max })}
                    onBlur={onBlurMin}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="text"
                    inputMode={integer ? "numeric" : "decimal"}
                    className="w-24 min-w-0"
                    value={value.max}
                    disabled={disabled}
                    onChange={(e) => onChange({ min: value.min, max: e.target.value })}
                    onBlur={onBlurMax}
                />
                {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
            </div>
            <Slider
                min={bMin}
                max={bMax}
                step={step}
                value={[lo, hi]}
                onValueChange={handleSlider}
                disabled={disabled || !Number.isFinite(bMin) || !Number.isFinite(bMax) || bMin >= bMax}
                className="pt-2 pb-1"
            />
        </div>
    );
}
