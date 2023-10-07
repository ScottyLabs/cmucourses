test change

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

To get started, run `npm install` in both the `frontend` and `backend` folders.

Also, we use [Doppler](https://www.doppler.com) to populate the environment with the necessary secrets to access the
database. Follow the instructions [here](https://docs.doppler.com/docs/install-cli) to install the Doppler CLI.
Run `doppler setup` in the parent folder to set this up.

### Frontend

To run the frontend in development mode:

```shell
cd frontend
npm run dev
```

This runs the frontend at `http://localhost:3010`. It also watches for changes and reloads when a file is saved.

To build and deploy the frontend, instead run:

```shell
npm run build
npm run start
```

### Backend

To run the backend in development mode:

```shell
cd backend
npm run dev
```

The backend should now be serving requests at `http://localhost:3000`.

To deploy the backend, run

```shell
npm run start
```

### Scrapers

More information about the scrapers used to collect the data may be found
at [this repo](https://github.com/ScottyLabs/course-scraper/).

## Technologies

The Course Tool is built with several technologies.

- The frontend is built using NextJS and React, Redux, Typescript and TailwindCSS.
- The backend uses Express, MongoDB and JS.
- The scrapers are written in JS.