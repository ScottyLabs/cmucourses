import "../styles/globals.css";

import { Provider } from "react-redux";
import type { AppProps } from "next/app";

import store, { persistor } from "../app/store";
import Header from "../components/Header";
import { PersistGate } from "redux-persist/integration/react";
import { useRouter } from "next/router";

import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  let activePage;
  switch (router.pathname) {
    case "/saved":
      activePage = "saved";
      break;
    case "/schedules":
      activePage = "schedules";
      break;
  }

  return (
    <>
      <Head>
        <title>ScottyLabs Course Tool Beta</title>
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Header activePage={activePage}>
            <Component {...pageProps} />
          </Header>
        </PersistGate>
      </Provider>
    </>
  );
}
