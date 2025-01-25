import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import nightwind from "nightwind/helper";

export default class MyDocument extends Document {
  render() {
    return (
      <Html className="bg-gray-50 min-h-full">
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <Script
            strategy="afterInteractive"
            src={"https://www.googletagmanager.com/gtag/js?id=G-BTYWCVFP11"}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BTYWCVFP11', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
          {<script dangerouslySetInnerHTML={{ __html: nightwind.init() }} />}
          <meta
            name="viewport"
            content="width=device-width, user-scalable=no"
          />
        </Head>
        <body className="bg-gray-50 min-h-screen">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
