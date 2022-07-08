import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import nightwind from "nightwind/helper";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
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
          {
            /* eslint-disable-next-line */
            <script dangerouslySetInnerHTML={{ __html: nightwind.init() }} />
          }
        </Head>
        <body className="bg-gray-50">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
