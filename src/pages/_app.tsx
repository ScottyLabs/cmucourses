import "../styles/globals.css";

import { Provider, useDispatch } from "react-redux";
import type { AppProps } from "next/app";

import store, { persistor } from "../app/store";
import Header from "../components/Header";
import { PersistGate } from "redux-persist/integration/react";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Header>
          <Component {...pageProps} />
        </Header>
      </PersistGate>
    </Provider>
  );
}
