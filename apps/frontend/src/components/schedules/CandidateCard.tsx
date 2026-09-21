import React from "react";
import ProgressBar from "~/components/ProgressBar";
import { Card } from "~/components/Card";
import { PRIMARY_BUTTON_CLASS } from "~/components/profile/fields";
import { ScheduleCandidate } from "~/app/scheduleGenerator";

const FIT_SCORE: Record<"FITS" | "CONFLICTS" | "UNKNOWN", number> = {
  FITS: 100,
  UNKNOWN: 50,
  CONFLICTS: 0,
};
const WORKLOAD_SCORE: Record<ScheduleCandidate["workloadFit"], number> = {
  IN_RANGE: 100,
  UNKNOWN: 75,
  UNDER: 40,
  OVER: 40,
};

const CandidateCard = ({
  candidate,
  index,
  onUse,
}: {
  candidate: ScheduleCandidate;
  index: number;
  onUse: () => void;
}) => (
  <Card>
    <div className="flex items-center justify-between">
      <Card.Header>Option {index + 1}</Card.Header>
      <span className="text-gray-400 text-xs">
        {Math.round(candidate.totalScore)} / 100
      </span>
    </div>
    <div className="mt-3 space-y-2">
      <ProgressBar
        value={FIT_SCORE[candidate.availability.status]}
        max={100}
        label={`Availability fit — ${candidate.availability.status.toLowerCase()}`}
      />
      <ProgressBar
        value={WORKLOAD_SCORE[candidate.workloadFit]}
        max={100}
        label={`Workload — ${candidate.totalUnits} units (${candidate.workloadFit.toLowerCase().replace("_", " ")})`}
      />
      <ProgressBar
        value={candidate.careerScore}
        max={100}
        label="Career/skill fit"
      />
      <ProgressBar
        value={candidate.preferenceScore}
        max={100}
        label="Saved preferences"
      />
    </div>
    <ul className="mt-3 divide-y divide-gray-100 text-gray-700 text-sm">
      {candidate.picks.map((pick) => (
        <li key={pick.courseID} className="py-1">
          {pick.courseID} — {pick.lecture}
          {pick.section ? ` / ${pick.section}` : ""}
        </li>
      ))}
    </ul>
    {candidate.reasons.length > 0 && (
      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-gray-400 text-xs">
        {candidate.reasons.slice(0, 4).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    )}
    <button
      type="button"
      onClick={onUse}
      className={`${PRIMARY_BUTTON_CLASS} mt-3 w-full`}
    >
      Use this schedule
    </button>
  </Card>
);

export default CandidateCard;
