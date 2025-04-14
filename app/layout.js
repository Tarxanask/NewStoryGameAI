'use client'

import React, { useEffect } from 'react'
import { Sora } from 'next/font/google'

import { GameProvider } from '@/context/Context'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// import 'bootstrap/dist/css/bootstrap.min.css'
import '@/public/css/plugins/fontawesome-all.min.css'

import '@/public/scss/style.scss'
import '@/app/globals.css'

import Image from 'next/image'

import bgShapeOne from '@/public/images/bg/bg-shape-one.png'
import bgShapeTwo from '@/public/images/bg/bg-shape-two.png'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
const sora = Sora({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
})

export default function RootLayout({ children }) {
  useEffect(() => {
    // Bootstrap JavaScript is now imported via CSS import above
    // If you still need specific Bootstrap JS functionality, you can import it here selectively
    // require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suits Interview Game</title>
        <link rel="apple-touch-icon" sizes="57x57" href="images/icons/favicon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="images/icons/favicon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="images/icons/favicon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="images/icons/favicon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="images/icons/favicon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="images/icons/favicon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="images/icons/favicon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="images/icons/favicon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="images/icons/favicon-180x180.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="images/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="images/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="images/icons/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="images/icons/favicon-192x192.png" />
        <link rel="shortcut icon" type="image/x-icon" href="images/icons/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="images/icons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="images/icons/favicon-144x144.png" />
        <meta name="msapplication-config" content="images/icons/browserconfig.xml"></meta>
      </head>
      <body className={sora.className} suppressHydrationWarning={true}>
        <main className="page-wrapper">
          <GameProvider>
            <section className="layout-fullscreen">
              <video autoPlay loop muted playsInline>
                <source src="images/bg/gradient.mp4" type="video/mp4" />
                <img src="images/bg/gradient.png" />
              </video>
              <div className="main-layout" data-black-overlay="1">
                <HeroUIProvider>
                  <NextThemesProvider attribute="class" defaultTheme="dark">
                    <div className="container">{children}</div>
                  </NextThemesProvider>
                </HeroUIProvider>
                <div className="bg-shape">
                  <Image className="bg-shape-one" width={640} src={bgShapeOne} alt="Bg Shape" />
                  <Image className="bg-shape-two" src={bgShapeTwo} width={626} alt="Bg Shape" />
                </div>
              </div>
            </section>
          </GameProvider>
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
