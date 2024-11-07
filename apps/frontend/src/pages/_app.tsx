import "~/styles/globals.css";

import { Provider } from "react-redux";
import type { AppProps } from "next/app";

import store, { persistor } from "~/app/store";
import { PersistGate } from "redux-persist/integration/react";

import Head from "next/head";

import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <ClerkProvider>
        <Head>
          <title>CMU Courses</title>
          <meta
            name="description"
            content="CMU Courses brings together course information, schedules and FCE data to help you plan your semesters."
          />
          <meta
            name="keywords"
            content="ScottyLabs, CMU, Carnegie Mellon, Courses, Course Tool, CMU Courses, FCEs, Ratings, Schedules, Scheduling"
          />
        </Head>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Component {...pageProps} />
          </PersistGate>
        </Provider>
      </ClerkProvider>
    </PostHogProvider>
  );
}
