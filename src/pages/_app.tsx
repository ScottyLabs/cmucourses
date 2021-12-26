import "../styles/globals.css";

import { Provider } from "react-redux";
import type { AppProps } from "next/app";

import store from "../app/store";
import Header from "../components/Header";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const MuiTheme = createTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    primary: {
      main: "#49278f",
    },
    secondary: {
      main: "#666",
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={MuiTheme}>
      <Provider store={store}>
        <Header>
          <Component {...pageProps} />
        </Header>
      </Provider>
    </ThemeProvider>
  );
}
