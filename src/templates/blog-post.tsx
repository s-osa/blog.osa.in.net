import React from "react"
import { Link, graphql } from "gatsby"
import "katex/dist/katex.min.css"
import { PageProps } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

const BlogPostTemplate: React.FC<PageProps<GatsbyTypes.BlogPostBySlugQuery>> = ({ data, location }) => {
  const post = data.markdownRemark!
  const frontMatter = post.frontmatter!
  const siteTitle = data.site!.siteMetadata!.title!

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={frontMatter.title!}
        description={post.excerpt}
      />
      <article itemScope itemType="http://schema.org/Article" className="blog-post">
        <header>
          <h1
            itemProp="headline"
            style={{
              marginTop: rhythm(1),
              marginBottom: 0
            }}
          >
            {frontMatter.title}
          </h1>
          <div style={{
            ...scale(-1 / 5),
            width: `100%`,
            display: `table`,
            marginBottom: rhythm(1)
          }}>
            <p
              style={{
                display: `table-cell`,
                textAlign: `left`
              }}
            >
              {frontMatter.date}
            </p>
            <p
              style={{
                display: `table-cell`,
                textAlign: `right`
              }}
            >
              {post.plainText!.length.toLocaleString()}文字
            </p>
          </div>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html! }}
          itemProp="articleBody"
          style={{
            marginBottom: rhythm(2)
          }}
        />
        <div style={{
          textAlign: `right`,
          fontSize: rhythm(1 / 2)
        }}>
          <Link to={`https://github.com/s-osa/blog.osa.in.net/edit/master/content/blog${post.fields!.slug}index.md`}
                target={"_blank"}>
            Propose changes
          </Link>
          {" / "}
          <Link to={`https://github.com/s-osa/blog.osa.in.net/commits/master/content/blog${post.fields!.slug}index.md`}
                target={"_blank"}>
            Revisions
          </Link>
        </div>
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
      plainText
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
