module.exports = {
  siteMetadata: {
    title: `blog.osa.in.net`,
    author: {
      name: `OSA Shunsuke`
    },
    description: `思考の dump`,
    siteUrl: `https://blog.osa.in.net/`,
    social: {
      twitter: `s_osa_`
    }
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`
      }
    },
    `gatsby-plugin-typegen`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`
            }
          },
          `gatsby-remark-katex`,
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`, // should be placed after `gatsby-remark-autolink-headers`
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`
        ]
      }
    },

    `gatsby-transformer-remark-plaintext`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-51724899-6`
      }
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `blog.osa.in.net`,
        short_name: `blog.osa.in.net`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#444444`,
        display: `minimal-ui`,
        icon: `content/assets/icon.png`
      }
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`
      }
    },
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['M PLUS Rounded 1c:300,700']
        }
      }
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: "blog.osa.in.net"
      }
    }
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ]
}
