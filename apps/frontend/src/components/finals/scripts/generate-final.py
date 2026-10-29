import json
import datetime
import pytesseract
import pdf2image
from PIL import Image
import pickle as pkl
import io
from time import strptime
import requests
import regex
import pymupdf

from pathlib import Path

# Get the absolute path of the directory containing the script
dir_path = Path(__file__).parent.resolve()

EXAMS_URL = "https://www.cmu.edu/hub/docs/final-exams.pdf"
API_URL = 'https://course.apis.scottylabs.org/courses/search?&page=1&schedules=true&keywords='
USE_MANUAL_PARSE = False


def detect_parse_state(txt_line):
    if "Teaching Space(s)" in txt_line or "Exam Assigned Space(s)" in txt_line:
        return "LOCATION"
    if "Delivery Mode" in txt_line:
        return "MODE"
    if "Time (EST USA)" in txt_line:
        return "TIME"
    if "Date" in txt_line:
        return "DATE"
    if "Course Sec Title" in txt_line:
        return "COURSE"
    if "Instructor(s)" in txt_line:
        return "INSTRUCTOR"
    return None


DATE_TIME_RE = regex.compile(
    r"^\w+, (\w+) (\d{1,2}) "
    r"(\d{1,2}):(\d{2}) ([ap])\.m\. - (\d{1,2}):(\d{2}) ([ap])\.m\.$"
)


def to_24h(hour, meridiem):
    return hour % 12 + (12 if meridiem == "p" else 0)


def convert_time_to_datetime_pair(time_str, year):
    """Thursday, December 10 05:30 p.m. - 08:30 p.m. -> (timestamp, timestamp)"""
    m = DATE_TIME_RE.match(time_str)
    if not m:
        raise ValueError(f"Unparseable exam time '{time_str}'")
    month_str, day, sh, sm, sp, eh, em, ep = m.groups()
    month = strptime(month_str, '%B').tm_mon
    start = datetime.datetime(year, month, int(day), to_24h(int(sh), sp), int(sm))
    end = datetime.datetime(year, month, int(day), to_24h(int(eh), ep), int(em))
    return [start.timestamp(), end.timestamp()]


def get_course_info(course_id):
    """Fetch course name and description from ScottyLabs API"""
    digits = "".join([c for c in course_id if c.isdigit()])
    if len(digits) >= 5:
        formatted_id = digits[:2] + "-" + digits[2:5]
    else:
        formatted_id = course_id

    try:
        response = requests.get(API_URL + formatted_id)
        data = response.json()
        docs = data.get('docs', [])
        match = next((c for c in docs if c.get('courseID') == formatted_id), None)
        if match:
            return match.get('name'), match.get('desc')
    except Exception as e:
        print(f"Error fetching info for {formatted_id}: {e}")
    return None, None


def main():
    print("Fetching and parsing PDF...")
    a = requests.get(EXAMS_URL)

    with open("final_exams.pdf", "wb") as f:
        f.write(a.content)

    txt_pages = ""

    # parses it using tag pdf
    with pymupdf.open("final_exams.pdf") as pdf:
        txt_pages = chr(12).join([page.get_text() for page in pdf])

    with open(f"{dir_path}/raw_text.txt", "w") as f:
        f.write(txt_pages)

    # PDF text is one field per line (see raw_text.txt). Match column lines, not a single stitched line.
    course_id_line = regex.compile(r"^\d{5}\s*$")
    section_line = regex.compile(r"^[A-Za-z0-9]{1,4}\s*$")
    date_re = regex.compile(
        r"(?:^|\s)((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), "
        r"(?:January|February|March|April|May|June|July|August|September|October|November|December) "
        r"\d{1,2})\s*$"
    )
    time_line_re = regex.compile(
        r"^\d{1,2}:\d{2} [ap]\.m\. - \d{1,2}:\d{2} [ap]\.m\.\s*$"
    )
    year = int(regex.search(r"(?:Fall|Spring|Summer) (\d{4})", txt_pages).group(1))
    final_exams = []
    print("Parsing schedule...")
    lines = txt_pages.split("\n")
    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        if not course_id_line.match(line):
            i += 1
            continue
        record = lines[i:i + 9]
        section = lines[i + 1].strip()
        if not section_line.match(section):
            raise ValueError(f"Bad section after course {line}: {record}")
        j = next((k for k in (i + 2, i + 3) if date_re.search(lines[k].strip())), None)
        if j is None:
            raise ValueError(f"No date for course {line}{section}: {record}")
        date_str = date_re.search(lines[j].strip()).group(1)
        time_str = lines[j + 1].strip()
        if not time_line_re.match(time_str):
            raise ValueError(f"Bad time for course {line}{section}: {record}")
        mode = lines[j + 2].strip()
        location = lines[j + 3].strip()
        # Delivery modes in Spring 2026 PDF: In Person, Remote, Cancelled/Canceled (+ optional date line as next row)
        if mode not in ("In Person", "Remote", "Cancelled", "Canceled", "CANCELED"):
            raise ValueError(f"Bad delivery mode for course {line}{section}: {record}")

        course_id = regex.sub(r"[^A-Z0-9]", "", line + section)

        ts_pair = convert_time_to_datetime_pair(date_str + " " + time_str, year)

        final_exams.append({
            "course": course_id,
            "start_time": ts_pair[0],
            "end_time": ts_pair[1],
            "location": location,
        })

        i = j + 4

    unique_exams = {(e["course"], e["start_time"], e["end_time"], e["location"]): e for e in final_exams}
    final_exams = list(unique_exams.values())

    print(
        f"Parsed {len(final_exams)} exams. Enriching with course info...")

    # Enrichment with API
    course_cache = {}
    enriched_finals = []

    for final in final_exams:
        course_id = final['course']
        # Use first 5 digits for caching
        base_id = "".join([c for c in course_id if c.isdigit()])[:5]

        if base_id not in course_cache:
            print(f"  Fetching info for {course_id}...")
            name, desc = get_course_info(course_id)
            course_cache[base_id] = (name, desc)

        name, desc = course_cache[base_id]
        if name:
            final['name'] = name
        if desc:
            final['desc'] = desc

        enriched_finals.append(final)

    print(f"Done. Saving to finals.json")
    with open(f'{dir_path}/../finals.json', 'w') as f:
        json.dump(enriched_finals, f, indent=4)


if __name__ == "__main__":
    main()
