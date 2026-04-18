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
API_URL = 'https://course-tools.apis.scottylabs.org/courses/search?&page=1&schedules=true&keywords='
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


def convert_time_to_datetime_pair(time_str):
    """Monday, May 5, 2026 01:00pm - 04:00pm -> (timestamp, timestamp)"""
    try:
        time_split = [x for x in time_str.split(" ") if x != ""]
        # Expecting: [DayOfWeek, Month, Day, Year, StartTime, -, EndTime]
        # Example: ['Monday,', 'May', '5,', '2026', '01:00pm', '-', '04:00pm']

        month_str = time_split[1]
        day_str = time_split[2].replace(",", "")
        year_str = time_split[3]

        month = strptime(month_str, '%B').tm_mon
        day = int(day_str)
        year = int(year_str)

        date_obj = datetime.datetime(year, month, day)

        start_time_str = time_split[4]
        end_time_str = time_split[6]

        start_time = strptime(start_time_str, "%I:%M%p")
        end_time = strptime(end_time_str, "%I:%M%p")

        start_datetime = datetime.datetime(
            date_obj.year, date_obj.month, date_obj.day, start_time.tm_hour, start_time.tm_min)
        end_datetime = datetime.datetime(
            date_obj.year, date_obj.month, date_obj.day, end_time.tm_hour, end_time.tm_min)

        return [start_datetime.timestamp(), end_datetime.timestamp()]
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return [0, 0]


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
        if docs and len(docs) > 0:
            match = next((c for c in docs if c.get(
                'courseID') == formatted_id), docs[0])
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
    date_line_re = regex.compile(
        r"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), "
        r"(January|February|March|April|May|June|July|August|September|October|November|December) "
        r"\d{1,2}, \d{4}\s*$"
    )
    time_line_re = regex.compile(
        r"^\d{1,2}:\d{2}[ap]m - \d{1,2}:\d{2}[ap]m\s*$"
    )
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
        if i + 1 >= len(lines):
            break
        section = lines[i + 1].strip()
        if not section_line.match(section):
            i += 1
            continue
        j = i + 2
        while j < len(lines) and not date_line_re.match(lines[j].strip()):
            j += 1
        if j >= len(lines) or not date_line_re.match(lines[j].strip()):
            i += 1
            continue
        date_str = lines[j].strip()
        time_str = lines[j + 1].strip()
        if not time_line_re.match(time_str):
            i += 1
            continue
        if j + 3 >= len(lines):
            i += 1
            continue
        mode = lines[j + 2].strip()
        location = lines[j + 3].strip()
        # Delivery modes in Spring 2026 PDF: In Person, Remote, Cancelled/Canceled (+ optional date line as next row)
        if mode not in ("In Person", "Remote", "Cancelled", "Canceled", "CANCELED"):
            i += 1
            continue

        course_id = regex.sub(r"[^A-Z0-9]", "", line + section)

        ts_pair = convert_time_to_datetime_pair(date_str + " " + time_str)

        final_exams.append({
            "course": course_id,
            "start_time": ts_pair[0],
            "end_time": ts_pair[1],
            "location": location,
        })

        i = j + 4

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
