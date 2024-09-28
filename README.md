# CMU Courses

CMU Courses (AKA ScottyLabs Course Tool) is a web application designed to aid students at Carnegie Mellon University in
browsing courses, including information about course evaluations and schedules. It is actively maintained
by [ScottyLabs](https://scottylabs.org).

This is the second iteration of the Course Tool. The second version is a rewrite of the frontend and backend, with the
inclusion of new features (currently a work-in-progress) such as:

- Search
- Filters
- Professor Search
- Schedule Creation

This new version is currently deployed at [cmucourses.com](https://cmucourses.com). This project is currently undergoing
development, so expect large changes to the codebase and features to be unstable.

## Getting Started
To get started, create a codespace from the github repository, then open it in VScode.

Navigate to the terminal and install bun by running the following commands: 

```
curl -fsSL https://bun.sh/install | bash
source /home/codespace/.bashrc
bun install
bun run dev
```

Create a .env file in your root directory, and add the following line to the file:
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"


If course descriptions are not loading, set the public backend url to the local address of the 3000 port. (Make sure that the URL does not have the trailing backslash.)


Ensure both 3000 and 3010 ports are set to public visibility.


### Running local build


Preview the local version of the code by right clicking on the 3010 port and view CMUcourses on your browser. 

### Scrapers

More information about the scrapers used to collect the data may be found
at [this repo](https://github.com/ScottyLabs/course-scraper/).

## Technologies

The Course Tool is built with several technologies.

- The frontend is built using NextJS and React, Redux, Typescript and TailwindCSS.
- The backend uses Express, MongoDB and JS.
- The scrapers are written in JS.
