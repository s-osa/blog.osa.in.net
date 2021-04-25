import React from "react"
import { graphql } from "gatsby"
import { PageProps } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage: React.FC<PageProps<GatsbyTypes.NotFoundPageQuery>> = ({
  data,
  location,
}) => {
  const siteTitle = data.site!.siteMetadata!.title!

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="404 Not Found" />
      <h1
        style={{
          textAlign: `center`,
          border: `none`,
          margin: `10rem 0`,
          color: `#888`,
        }}
      >
        404 Not Found
      </h1>
    </Layout>
  )
}

export default NotFoundPage

export const pageQuery = graphql`
  query NotFoundPage {
    site {
      siteMetadata {
        title
      }
    }
  }
`
