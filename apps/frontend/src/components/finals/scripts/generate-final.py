import json
import datetime
import pytesseract
import pdf2image
from PIL import Image
import pickle as pkl
import io
from time import strptime
import requests
import pypdf
import regex

import json
import datetime
import pytesseract
import pdf2image
from PIL import Image
import pickle as pkl
import io
from time import strptime
import requests
import pypdf
import regex

from pathlib import Path

# Get the absolute path of the directory containing the script
dir_path = Path(__file__).parent.resolve()

EXAMS_URL = "https://www.cmu.edu/hub/docs/final-exams.pdf"
API_URL = 'https://course-tools.apis.scottylabs.org/courses/search?&page=1&schedules=true&keywords='
USE_MANUAL_PARSE = False


def detect_parse_state(txt_line):
    if "Teaching Space(s)" in txt_line:
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
    if USE_MANUAL_PARSE:
        print("Using manual OCR text from raw_ocr.txt")
        txt_pages = open(f"{dir_path}/raw_ocr.txt", "r").read()
    else:
        print("Fetching and parsing PDF...")
        try:
            txt_pages = pkl.load(open(f"{dir_path}/parsed_exams.pkl", 'rb'))
        except:
            txt_pages = None
            if not txt_pages:
                a = requests.get(EXAMS_URL)
                img = pdf2image.convert_from_bytes(a.content)
                txt_pages = ""
                for page in img:
                    txt_pages += "\n" + \
                        pytesseract.image_to_string(
                            page, lang="eng", config='--psm 6')
                pkl.dump(txt_pages, open("parsed_exams.pkl", 'wb'))

        with open(f"{dir_path}/raw_ocr.txt", "w") as f:
            f.write(txt_pages)

    # Regex setup
    course_regex = r"\d{5} [A-Z0-9]{1,4}.*"
    date_regex = r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (April|May|December) \d{1,2}, 202[56]"
    time_regex = r"\d{2}:\d{2}[ap]m - \d{2}:\d{2}[ap]m"
    teaching_space_regex = r"(Remote|In Person|Canceled|CANCELED) (TBD -assigned after mini-[24] add deadline|To be assigned after Mini-2 add deadline|To Be Scheduled after the Mini-2 Add Deadline|CANCELED|Canceled|Remote|(PTC|AH|AN|BH|PH|BR|CIC|CUC|CFA|CYH|DH|FM|GHC|HOA|HBH|HH|HL|MM|MI|NSH|PC|POS|PCA|REH|SC|EDS|TCS|TEP|WH|WEH|WWG|WF|WQ|2SC|3SC|4SC|CC|UT|FRB|INI|PO|MC|BOS|CLY|DON|FAF|FCL|FIF|FBA|GQ1|GQ2|GQ3|GQ4|GQ5|GQ6|HAM|HEN|HIL|MMA|MCG|MOE|MOR|MUD|NVL|ROF|RES|ROS1|ROS2|ROS3|SCO|SPT|STE|WEL|WOO|SH) (Rangos Hall|[A-Z]{0,3}[0-9]{0,4}([A-Z]{0,1}( Atrium){0,1}))|HLAS|TBA)"

    full_line_regex = fr"({course_regex}) *({date_regex}) *({time_regex}) *({teaching_space_regex})(.*)"

    final_exams = []
    print("Parsing schedule...")
    for line in txt_pages.split("\n"):
        match = regex.finditer(full_line_regex, line)
        matches = [m for m in match]
        if not matches:
            continue

        group = matches[0].groups()
        course_str = group[0].strip()
        date_str = group[1].strip()
        time_str = group[4].strip()
        location_str = group[5].strip()

        # Clean course ID (e.g., "151121" from "15112 1 ...")
        course_id = regex.sub(r'[^a-zA-Z0-9]', '',
                              " ".join(course_str.split(" ")[:2]))

        # Calculate timestamps
        ts_pair = convert_time_to_datetime_pair(date_str + " " + time_str)

        final_exams.append({
            "course": course_id,
            "start_time": ts_pair[0],
            "end_time": ts_pair[1],
            "location": location_str
        })

    print(f"Parsed {len(final_exams)} exams. Enriching with course info...")

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
