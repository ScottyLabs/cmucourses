import { getVisibleLectureTimes } from "./events";
import { Time } from "./types";

const meeting = (begin: string, end: string, days: number[]): Time => ({
  begin,
  end,
  days,
  building: "",
  room: "",
});

describe("getVisibleLectureTimes", () => {
  it("hides a lecture meeting contained by its linked section", () => {
    const lecture = meeting("02:00PM", "03:50PM", [1, 3, 5]);
    const section = meeting("02:00PM", "04:50PM", [1, 3, 5]);

    expect(getVisibleLectureTimes([lecture], [section])).toEqual([]);
  });

  it("keeps a separate lecture meeting", () => {
    const lecture = meeting("10:00AM", "10:50AM", [1, 3]);
    const section = meeting("02:00PM", "02:50PM", [5]);

    expect(getVisibleLectureTimes([lecture], [section])).toEqual([lecture]);
  });

  it("keeps lecture days that are not covered by the section", () => {
    const lecture = meeting("02:00PM", "03:50PM", [1, 3, 5]);
    const section = meeting("02:00PM", "04:50PM", [1, 3]);

    expect(getVisibleLectureTimes([lecture], [section])).toEqual([
      { ...lecture, days: [5] },
    ]);
  });
});
