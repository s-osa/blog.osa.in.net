import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article itemScope itemType="http://schema.org/Article">
        <header>
          <h1
            itemProp="headline"
            style={{
              marginTop: rhythm(1),
              marginBottom: 0
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1)
            }}
          >
            {post.frontmatter.date}
          </p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
          style={{
            marginBottom: rhythm(2)
          }}
        />
        <div style={{
          textAlign: `right`,
        }}>
          <Link to={`https://github.com/s-osa/blog.osa.in.net/blob/master/content/blog${post.fields.slug}index.md`} target={"_blank"}>
            Fix typo
          </Link>
        </div>
        <hr
          style={{
            marginBottom: rhythm(1/2)
          }}
        />
      </article>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
      }
      fields {
        slug
      }
    }
  }
`
