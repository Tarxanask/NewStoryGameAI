'use client'

import React from 'react'
import Link from 'next/link'

const ErrorPage = () => {
  return (
    <>
      <div className="inner flex-1 text-center">
        <h1 className="theme-gradient" style={{ fontSize: '10em' }}>
          404!
        </h1>
        <h3>
          Lost in the Clouds? That's alright, that's what we are here for! <br /> Let’s Redirect
          You!
        </h3>
      </div>
      <Link className="btn-read-more my-4" href="/">
        <span>
          Yes Please! <i className="fa fa-cloud"></i>
        </span>
      </Link>
    </>
  )
}

export default ErrorPage
