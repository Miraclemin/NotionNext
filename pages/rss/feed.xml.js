import BLOG from '@/blog.config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { decryptEmail } from '@/lib/plugins/mailEncrypt'
import { Feed } from 'feed'

export async function getServerSideProps({ res, locale }) {
  try {
    const props = await fetchGlobalAllData({ from: 'rss-dynamic', locale })
    const { allPages, NOTION_CONFIG, siteInfo } = props || {}

    const posts =
      allPages?.filter(
        page => page.type === 'Post' && page.status === 'Published'
      ) || []

    const link = siteInfo?.link || BLOG.LINK
    const title = siteInfo?.title || BLOG.AUTHOR
    const description = siteInfo?.description || BLOG.BIO
    const author = NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR
    const language = NOTION_CONFIG?.LANG || BLOG.LANG
    const encryptedContactEmail =
      NOTION_CONFIG?.CONTACT_EMAIL || BLOG.CONTACT_EMAIL
    const contactEmail = encryptedContactEmail
      ? decryptEmail(encryptedContactEmail)
      : undefined

    const feed = new Feed({
      title,
      description,
      id: link,
      link,
      language,
      favicon: `${link}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${author}`,
      author: {
        name: author,
        email: contactEmail,
        link
      }
    })

    posts.forEach(post => {
      feed.addItem({
        title: post.title,
        id: `${link}/${post.slug}`,
        link: `${link}/${post.slug}`,
        description: post.summary || '',
        date: new Date(post?.publishDay || post?.publishDate || Date.now())
      })
    })

    res.setHeader('Content-Type', 'text/xml; charset=utf-8')
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
    res.write(feed.rss2())
    res.end()
  } catch (error) {
    res.statusCode = 500
    res.end(`Error generating RSS: ${error.message}`)
  }

  return { props: {} }
}

export default function RssFeed() {
  return null
}
