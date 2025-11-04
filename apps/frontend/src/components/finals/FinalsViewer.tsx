import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import FinalsSearch from "./FinalsSearch";
import { finalsSlice } from "~/app/finals";
import Topbar from "~/components/Topbar";
import { Card } from "~/components/Card";
import Link from "~/components/Link";
import {
    ArrowUpTrayIcon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import finalsData from "./finals.json";
import {
    ColumnDef,
    SortingState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import DataTable from "./datatable";
import { classNames } from "~/app/utils";
import ICAL from "ical.js";
import { GetTooltip } from "~/components/GetTooltip";

type RawFinal = {
    course: string;
    start_time: number;
    end_time: number;
    location: string;
    desc: string;
    name: string;
};

type FinalExamRow = {
    name: string;
    course: string;
    section: string
    day: string;
    start: string;
    end: string;
    location: string;
    startTimestamp: number;
    desc: string;
};

const TIMEZONE = "America/New_York";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIMEZONE,
});

const FINALS_ROWS: FinalExamRow[] = (finalsData as RawFinal[])
    .map((exam) => {
        const start = new Date(Math.floor(exam.start_time) * 1000);
        const end = new Date(Math.floor(exam.end_time) * 1000);

        return {
            course: exam.course.slice(0, 5),
            section: exam.course.slice(5),
            day: DATE_FORMATTER.format(start),
            start: TIME_FORMATTER.format(start),
            end: TIME_FORMATTER.format(end),
            location: exam.location,
            startTimestamp: exam.start_time,
            desc: exam.desc,
            name: exam.name
        };
    })
    .sort((a, b) => a.startTimestamp - b.startTimestamp);

const formatCourseCode = (courseCode: string) => {
    if (courseCode.length === 5) {
        return `${courseCode.slice(0, 2)}-${courseCode.slice(2)}`;
    }
    return courseCode;
};

const columns: ColumnDef<FinalExamRow>[] = [
    {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => {
            const courseCode = row.original.course;
            const formattedCourseCode = formatCourseCode(courseCode);
            const id = `finals-table-${courseCode}`;

            return <><Link data-tooltip-id={id} href={`/course/${formattedCourseCode}`}>{formattedCourseCode}</Link><GetTooltip id={id} children={<><b>{row.original.name as string}</b> <br />{row.original.desc as string}</>} /></>;
        },
    },
    {
        accessorKey: "section",
        header: "Section",
    },
    {
        accessorKey: "day",
        header: "Day",
    },
    {
        accessorKey: "start",
        header: "Start Time",
    },
    {
        accessorKey: "end",
        header: "End Time",
    },
    {
        accessorKey: "location",
        header: "Location",
    },
];

const SIO_CAL_EXPORT_URL = "https://s3.andrew.cmu.edu/sio/mpa/secure/export/schedule/F25_schedule.ics";

export default function FinalsViewer() {
    const dispatch = useAppDispatch();
    const ownCourses = useAppSelector((state) => state.finals.ownCourses);
    const search = useAppSelector((state) => state.finals.search);
    const numResults = useAppSelector((state) => state.finals.numResults);
    const showOwn = useAppSelector((state) => state.finals.showOwn);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const filteredRows = useMemo(() => {

        const normalized = search.trim().toLowerCase();
        if (!normalized && ownCourses.length === 0) {
            return FINALS_ROWS;
        }
        if (showOwn && ownCourses.length > 0) {
            return FINALS_ROWS.filter((row) => {
                return (
                    (row.course + row.section).toLowerCase().includes(normalized) &&
                    ownCourses.includes(row.course + row.section)
                );
            });
        }
        return FINALS_ROWS.filter((row) => {
            return (
                (row.course + row.section).toLowerCase().includes(normalized)
            );
        });
    }, [search, showOwn, ownCourses]);

    function uploaded() {
        return ownCourses.length > 0;
    }

    useEffect(() => {
        if (filteredRows.length !== numResults) {
            dispatch(finalsSlice.actions.setNumResults(filteredRows.length));
        }
    }, [filteredRows.length, numResults]);

    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: filteredRows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        file.text().then((text) => {
            const calData = ICAL.parse(text);
            const newScheduleData: { code: string; section: string }[] = [];
            for (const entry of calData[2]) {
                if (entry[0] !== "vevent") continue;
                const props = entry[1];
                let summary = "";
                let description = "";
                let location = "";
                let rrule = undefined;
                let start = undefined;
                let end = undefined;
                for (const prop of props) {
                    if (prop[0] === "summary") summary = prop[3];
                    if (prop[0] === "description") description = prop[3];
                    if (prop[0] === "location") location = prop[3];
                    if (prop[0] === "rrule") rrule = prop[3];
                    if (prop[0] === "dtstart") start = prop[3];
                    if (prop[0] === "dtend") end = prop[3];
                }
                const summaryParts = summary.split(" :: ");
                if (summaryParts.length < 2) continue;
                const codeSection = (summaryParts[1] ?? "").split(" ");
                const code = codeSection[0] ?? "";
                const section = codeSection.length > 1 && codeSection[1] ? codeSection[1] : "";
                newScheduleData.push({ code: String(code), section: String(section) });
            }
            dispatch(finalsSlice.actions.setOwnCourses(newScheduleData.map(c => (c.code + c.section))));
        });
    };

    return (
        <>
            <Topbar>
                <div className="flex flex-col gap-1 mb-2">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Find your finals
                    </h1>
                    {!uploaded() && (
                        <>
                            <p className="text-sm text-gray-500">
                                1: Download <Link href={SIO_CAL_EXPORT_URL} openInNewTab>Calendar Export</Link> from SIO.
                            </p>
                            <p className="text-sm text-gray-500">
                                2: Import the .ics file below.
                            </p>
                        </>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    {/* Left: buttons and checkbox */}
                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            ref={fileInputRef}
                            id="finals-upload-input"
                            type="file"
                            accept=".ics"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            Upload schedule
                        </button>
                        <a
                            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                            href={SIO_CAL_EXPORT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            SIO Export
                        </a>
                        {uploaded() && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="show-own-checkbox"
                                    checked={showOwn}
                                    onChange={e => dispatch(finalsSlice.actions.setShowOwn(e.target.checked))}
                                />
                                <label htmlFor="show-own-checkbox" className="text-sm text-gray-700">
                                    Only show finals in my schedule
                                </label>
                            </div>
                        )}
                    </div>
                    {/* Right: schedule imported status */}
                    <span
                        className={classNames(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
                            uploaded()
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-500"
                        )}
                    >
                        <span
                            className={classNames(
                                "h-2 w-2 rounded-full",
                                uploaded() ? "bg-green-500" : "bg-gray-300"
                            )}
                        />
                        {uploaded() ? "Schedule imported" : "No schedule uploaded"}
                    </span>
                </div>
                <div>
                    <FinalsSearch />
                </div>
            </Topbar>
            <div className="mx-auto w-full px-4 pb-12 pt-6">
                <Card>
                    <div
                        className={classNames(
                            "flex flex-col gap-6",
                            "transition-colors"
                        )}
                    >
                        <div className="p-2 mt-4 ml-2 mr-2 overflow-x-auto bg-gray-50 rounded-md">
                            <DataTable columns={columns} table={table} />
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
