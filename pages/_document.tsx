import { Html, Head, Main, NextScript } from 'next/document'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || ''

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <meta name="description" content="Interactive Simulations: Stop memorizing, Start Understanding!" />
        <link rel="icon" type="image/png" href={`${basePath}/favicon/favicon-96x96.png`} sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/favicon/favicon.svg`} />
        <link rel="shortcut icon" href={`${basePath}/favicon/favicon.ico`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/favicon/apple-touch-icon.png`} />
        <meta name="theme-color" content="#6366f1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}