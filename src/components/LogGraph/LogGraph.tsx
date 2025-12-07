import { useMemo } from "react";
import type { DailyLog, DailyLogSegment } from "@/lib/api";

interface LogGraphProps {
    log: DailyLog;
    width?: number;
    height?: number;
}

const ROW_HEIGHT = 60; // Increased for better spacing
const ROW_GAP = 12; // Increased gap between rows
const SLOTS_PER_HOUR = 4; // 15-minute increments
const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR; // 96 slots per day
const LABEL_WIDTH = 160; // Wider for better label readability
const TIME_LABEL_HEIGHT = 60; // Increased for better spacing
const SUMMARY_WIDTH = 180;
const GRAPH_AREA_HEIGHT = TIME_LABEL_HEIGHT + 4 * (ROW_HEIGHT + ROW_GAP);

const STATUS_ROWS = [
    { num: 1, label: "OFF DUTY" },
    { num: 2, label: "SLEEPER" },
    { num: 3, label: "DRIVING" },
    { num: 4, label: "ON DUTY (NOT DRIVING)" },
] as const;

function normalizeSegmentIndices(
    segments: DailyLogSegment[]
): DailyLogSegment[] {
    return segments.map((segment) => ({
        ...segment,
        endIndex: segment.endIndex === 0 ? TOTAL_SLOTS : segment.endIndex,
    }));
}
function getStatusRowIndex(status: string): number {
    const normalized = status.toUpperCase().trim();
    if (normalized.includes("OFF") && !normalized.includes("DUTY")) return 0;
    if (normalized.includes("SLEEPER")) return 1;
    if (normalized.includes("DRIVING")) return 2;
    if (
        normalized.includes("ON DUTY") ||
        normalized.includes("ON_DUTY") ||
        normalized.includes("ON-DUTY")
    )
        return 3;
    return 0;
}

function formatTime12Hour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "NOON";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
}

function calculateHoursPerStatus(
    segments: DailyLogSegment[]
): Record<string, number> {
    const hours: Record<string, number> = {
        OFF: 0,
        SLEEPER: 0,
        DRIVING: 0,
        "ON DUTY": 0,
    };

    segments.forEach((segment) => {
        const duration =
            (segment.endIndex - segment.startIndex) / SLOTS_PER_HOUR; // Convert slots to hours
        const status = segment.status.toUpperCase().trim();

        if (status.includes("OFF") && !status.includes("DUTY")) {
            hours.OFF += duration;
        } else if (status.includes("SLEEPER")) {
            hours.SLEEPER += duration;
        } else if (status.includes("DRIVING")) {
            hours.DRIVING += duration;
        } else if (
            status.includes("ON DUTY") ||
            status.includes("ON_DUTY") ||
            status.includes("ON-DUTY")
        ) {
            hours["ON DUTY"] += duration;
        }
    });

    return hours;
}

export default function LogGraph({
    log,
    width = 2000, // Increased default width for better spacing
    height = GRAPH_AREA_HEIGHT,
}: LogGraphProps) {
    const graphWidth = width - SUMMARY_WIDTH;
    const slotWidth = (graphWidth - LABEL_WIDTH) / TOTAL_SLOTS;

    // Normalize segments to handle endIndex: 0 (midnight) as 96
    const normalizedSegments = useMemo(
        () => normalizeSegmentIndices(log.segments),
        [log.segments]
    );
    // Calculate hours per status
    const hoursPerStatus = useMemo(
        () => calculateHoursPerStatus(normalizedSegments),
        [normalizedSegments]
    );

    // Build stepped line path - ensure sequential, non-overlapping segments
    const steppedLinePath = useMemo(() => {
        if (normalizedSegments.length === 0) return "";

        // Sort segments by startIndex to ensure proper order
        const sortedSegments = [...normalizedSegments].sort(
            (a, b) => a.startIndex - b.startIndex
        );

        const path: string[] = [];
        let currentX = 0;
        let currentY = 0;
        let isFirst = true;

        sortedSegments.forEach((segment, idx) => {
            const startX = LABEL_WIDTH + segment.startIndex * slotWidth;
            const endX = LABEL_WIDTH + segment.endIndex * slotWidth;
            const rowIndex = getStatusRowIndex(segment.status);
            const y =
                TIME_LABEL_HEIGHT +
                rowIndex * (ROW_HEIGHT + ROW_GAP) +
                ROW_HEIGHT / 2;

            if (isFirst) {
                // First segment: move to start position and draw to end
                path.push(`M ${startX} ${y}`);
                path.push(`L ${endX} ${y}`);
                currentX = endX;
                currentY = y;
                isFirst = false;
            } else {
                const prevSegment = sortedSegments[idx - 1];
                const prevRowIndex = getStatusRowIndex(prevSegment.status);
                const prevEndX = LABEL_WIDTH + prevSegment.endIndex * slotWidth;

                // Ensure we're at the exact end of the previous segment
                // Segments should be sequential: prevEndX should equal startX (or there's a gap)
                if (Math.abs(currentX - prevEndX) > 0.1) {
                    // Ensure we're at the correct end position
                    path.push(`L ${prevEndX} ${currentY}`);
                    currentX = prevEndX;
                }

                // Check if status changed
                if (prevRowIndex !== rowIndex) {
                    // Status changed: draw vertical transition at the transition point
                    // The transition happens exactly at the end of previous segment
                    path.push(`L ${currentX} ${y}`); // Vertical transition to new row
                    // If there's a gap, draw horizontal line to start of new segment
                    if (currentX < startX - 0.1) {
                        path.push(`L ${startX} ${y}`);
                    }
                } else {
                    // Same status: continue horizontally
                    // If there's a gap between segments, draw a line to bridge it
                    if (currentX < startX - 0.1) {
                        path.push(`L ${startX} ${y}`);
                    }
                }

                // Draw horizontal line for the segment duration
                path.push(`L ${endX} ${y}`);
                currentX = endX;
                currentY = y;
            }
        });

        return path.join(" ");
    }, [normalizedSegments, slotWidth]);

    const hourLines = useMemo(() => {
        return Array.from({ length: 25 }, (_, i) => ({
            x: LABEL_WIDTH + i * SLOTS_PER_HOUR * slotWidth,
            hour: i,
        }));
    }, [slotWidth]);

    const quarterHourTicks = useMemo(() => {
        const ticks: { x: number; isHour: boolean }[] = [];
        for (let i = 0; i <= TOTAL_SLOTS; i++) {
            ticks.push({
                x: LABEL_WIDTH + i * slotWidth,
                isHour: i % SLOTS_PER_HOUR === 0,
            });
        }
        return ticks;
    }, [slotWidth]);

    return (
        <div className='w-full overflow-x-auto border border-border bg-white rounded-lg'>
            <svg width={width} height={height} className='block'>
                {/* Graph Area */}
                <g>
                    {/* Time labels */}
                    {hourLines.map((line, idx) => (
                        <g key={idx}>
                            <line
                                x1={line.x}
                                y1={TIME_LABEL_HEIGHT}
                                x2={line.x}
                                y2={GRAPH_AREA_HEIGHT}
                                stroke='hsl(var(--border))'
                                strokeWidth={1}
                                opacity={0.6}
                            />
                            {idx < 24 && (
                                <text
                                    x={
                                        line.x +
                                        (SLOTS_PER_HOUR * slotWidth) / 2
                                    }
                                    y={TIME_LABEL_HEIGHT - 12}
                                    textAnchor='middle'
                                    className='text-sm fill-foreground font-medium'
                                >
                                    {formatTime12Hour(idx)}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* Quarter-hour ticks */}
                    {quarterHourTicks.map((tick, idx) => (
                        <line
                            key={idx}
                            x1={tick.x}
                            y1={TIME_LABEL_HEIGHT + (tick.isHour ? 0 : 10)}
                            x2={tick.x}
                            y2={GRAPH_AREA_HEIGHT}
                            stroke='hsl(var(--border))'
                            strokeWidth={tick.isHour ? 1 : 0.5}
                            strokeDasharray={tick.isHour ? "0" : "2,2"}
                            opacity={tick.isHour ? 0.6 : 0.2}
                        />
                    ))}

                    {/* Row labels and horizontal lines */}
                    {STATUS_ROWS.map((statusRow, rowIdx) => {
                        const y =
                            TIME_LABEL_HEIGHT +
                            rowIdx * (ROW_HEIGHT + ROW_GAP) +
                            ROW_HEIGHT / 2;
                        const rowTopY =
                            TIME_LABEL_HEIGHT + rowIdx * (ROW_HEIGHT + ROW_GAP);
                        return (
                            <g key={statusRow.label}>
                                <text
                                    x={LABEL_WIDTH - 16}
                                    y={y + 6}
                                    textAnchor='end'
                                    className='text-sm fill-foreground font-semibold'
                                >
                                    {statusRow.num}: {statusRow.label}
                                </text>
                                <line
                                    x1={LABEL_WIDTH}
                                    y1={rowTopY}
                                    x2={graphWidth}
                                    y2={rowTopY}
                                    stroke='hsl(var(--border))'
                                    strokeWidth={1.5}
                                    opacity={0.6}
                                />
                            </g>
                        );
                    })}

                    {/* Stepped line graph */}
                    {steppedLinePath && (
                        <path
                            d={steppedLinePath}
                            fill='none'
                            stroke='#111'
                            strokeWidth={3}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    )}

                    {/* Status change markers - only show at actual transitions */}
                    {normalizedSegments.map((segment, idx) => {
                        // Sort segments to match path rendering
                        const sortedSegments = [...normalizedSegments].sort(
                            (a, b) => a.startIndex - b.startIndex
                        );
                        const sortedIdx = sortedSegments.findIndex(
                            (s) => s === segment
                        );

                        const x = LABEL_WIDTH + segment.startIndex * slotWidth;
                        const rowIndex = getStatusRowIndex(segment.status);
                        const y =
                            TIME_LABEL_HEIGHT +
                            rowIndex * (ROW_HEIGHT + ROW_GAP) +
                            ROW_HEIGHT / 2;

                        // Only show marker if this is a status change (not first segment and status changed)
                        const isStatusChange =
                            sortedIdx > 0 &&
                            getStatusRowIndex(
                                sortedSegments[sortedIdx - 1].status
                            ) !== rowIndex;

                        return (
                            <g key={`marker-${idx}`}>
                                {/* Show marker at start if status changed */}
                                {isStatusChange && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={4}
                                        fill='#111'
                                        stroke='white'
                                        strokeWidth={2}
                                    />
                                )}
                                {/* Show marker at end of last segment */}
                                {sortedIdx === sortedSegments.length - 1 && (
                                    <circle
                                        cx={
                                            LABEL_WIDTH +
                                            segment.endIndex * slotWidth
                                        }
                                        cy={y}
                                        r={4}
                                        fill='#111'
                                        stroke='white'
                                        strokeWidth={2}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Bottom border of graph area */}
                    <line
                        x1={LABEL_WIDTH}
                        y1={GRAPH_AREA_HEIGHT}
                        x2={graphWidth}
                        y2={GRAPH_AREA_HEIGHT}
                        stroke='hsl(var(--border))'
                        strokeWidth={2}
                        opacity={0.8}
                    />
                </g>

                {/* Hours Summary Panel */}
                <g>
                    {/* Background */}
                    <rect
                        x={graphWidth}
                        y={0}
                        width={SUMMARY_WIDTH}
                        height={GRAPH_AREA_HEIGHT}
                        fill='hsl(var(--muted))'
                        opacity={0.1}
                    />
                    {/* Border */}
                    <line
                        x1={graphWidth}
                        y1={0}
                        x2={graphWidth}
                        y2={GRAPH_AREA_HEIGHT}
                        stroke='hsl(var(--border))'
                        strokeWidth={2}
                    />

                    {/* Title */}
                    <text
                        x={graphWidth + SUMMARY_WIDTH / 2}
                        y={TIME_LABEL_HEIGHT - 12}
                        textAnchor='middle'
                        className='text-sm fill-foreground font-semibold'
                    >
                        Hours Summary
                    </text>

                    {/* Hours for each status */}
                    {STATUS_ROWS.map((statusRow, rowIdx) => {
                        const y =
                            TIME_LABEL_HEIGHT +
                            rowIdx * (ROW_HEIGHT + ROW_GAP) +
                            ROW_HEIGHT / 2 +
                            5;
                        const statusKey =
                            rowIdx === 0
                                ? "OFF"
                                : rowIdx === 1
                                ? "SLEEPER"
                                : rowIdx === 2
                                ? "DRIVING"
                                : "ON DUTY";
                        const hours = hoursPerStatus[statusKey] || 0;

                        return (
                            <g key={`summary-${statusRow.label}`}>
                                <text
                                    x={graphWidth + 12}
                                    y={y}
                                    className='text-sm fill-foreground font-semibold'
                                >
                                    {statusRow.num}: {hours.toFixed(1)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Total Hours */}
                    <text
                        x={graphWidth + SUMMARY_WIDTH / 2}
                        y={GRAPH_AREA_HEIGHT - 20}
                        textAnchor='middle'
                        className='text-sm fill-foreground font-bold'
                    >
                        Total: 24.0
                    </text>
                </g>
            </svg>

            {/* Remarks Table */}
            {normalizedSegments.some((s) => s.remarks || s.location) && (
                <div className='mt-6 border-t-2 border-border pt-6'>
                    <h3 className='text-base font-semibold text-foreground mb-4'>
                        Activity Log & Remarks
                    </h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm border-collapse'>
                            <thead>
                                <tr className='border-b-2 border-border bg-muted/30'>
                                    <th className='text-left py-3 px-4 font-semibold text-foreground'>
                                        Time
                                    </th>
                                    <th className='text-left py-3 px-4 font-semibold text-foreground'>
                                        Status
                                    </th>
                                    <th className='text-left py-3 px-4 font-semibold text-foreground'>
                                        Location
                                    </th>
                                    <th className='text-left py-3 px-4 font-semibold text-foreground'>
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {normalizedSegments
                                    .sort((a, b) => a.startIndex - b.startIndex)
                                    .map((segment, idx) => {
                                        const startTime = new Date(
                                            segment.startTime
                                        );
                                        const endTime = new Date(
                                            segment.endTime
                                        );
                                        const duration =
                                            (segment.endIndex -
                                                segment.startIndex) /
                                            SLOTS_PER_HOUR;

                                        const formatTime = (
                                            date: Date
                                        ): string => {
                                            return date.toLocaleTimeString(
                                                "en-US",
                                                {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }
                                            );
                                        };

                                        return (
                                            <tr
                                                key={idx}
                                                className='border-b border-border/50 hover:bg-muted/20 transition-colors'
                                            >
                                                <td className='py-3 px-4 text-muted-foreground font-medium'>
                                                    {formatTime(startTime)} -{" "}
                                                    {formatTime(endTime)}
                                                    <span className='text-muted-foreground/70 ml-2'>
                                                        ({duration.toFixed(1)}h)
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4'>
                                                    <span
                                                        className='inline-block px-3 py-1 rounded-md text-xs font-semibold'
                                                        style={{
                                                            backgroundColor:
                                                                getStatusColor(
                                                                    segment.status
                                                                ) + "20",
                                                            color: getStatusColor(
                                                                segment.status
                                                            ),
                                                        }}
                                                    >
                                                        {segment.status}
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-foreground'>
                                                    {segment.location || "-"}
                                                </td>
                                                <td className='py-3 px-4 text-foreground'>
                                                    {segment.remarks || "-"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function getStatusColor(status: string): string {
    const normalized = status.toUpperCase().trim();
    const STATUS_COLORS: Record<string, string> = {
        OFF: "hsl(var(--status-off))",
        SLEEPER: "hsl(var(--status-sleeper))",
        DRIVING: "hsl(var(--status-driving))",
        "ON DUTY": "hsl(var(--status-on-duty))",
        "ON DUTY (NOT DRIVING)": "hsl(var(--status-on-duty))",
        ON_DUTY: "hsl(var(--status-on-duty))",
        "ON-DUTY": "hsl(var(--status-on-duty))",
    };
    return (
        STATUS_COLORS[normalized] ||
        STATUS_COLORS[normalized.replace(/\s+/g, "_")] ||
        STATUS_COLORS[normalized.replace(/\s+/g, "-")] ||
        STATUS_COLORS.OFF
    );
}
