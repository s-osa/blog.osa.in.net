import React from "react"
import { Link } from "gatsby"
import { WindowLocation } from "@reach/router"

import "./common.scss"
import { rhythm } from "../utils/typography"

const Layout: React.FC<{ title: string, location: WindowLocation<unknown> }> = ({ location, title, children }) => {
  const rootPath = `/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          marginTop: 0
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          marginTop: 0
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(30),
        padding: `${rhythm(1)} ${rhythm(3 / 4)}`
      }}
    >
      <header>{header}</header>
      <main>{children}</main>

      <hr
        style={{
          marginTop: rhythm(1 / 2),
          marginBottom: rhythm(1 / 2)
        }}
      />

      <footer style={{
        textAlign: `center`,
        color: `#666666`,
        fontSize: rhythm(1 / 2)
      }}>
        © 2020-{new Date().getFullYear()}
        {" "}
        <a href={"https://osa.in.net/"} target="_blank" rel="noreferrer noopener">
          OSA Shunsuke
        </a>
      </footer>
    </div>
  )
}

export default Layout
