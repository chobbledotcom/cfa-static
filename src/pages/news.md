---
name: News
meta_description:
meta_title: News

eleventyNavigation:
  key: News
  order: 3
blocks:
  - type: markdown
    content: |
      ## News

      On a real website this is where you'd list your news posts - saving your visitors from needing to click through to social media to learn about what you've been up to.

      Your news posts are also pulled through to the [RSS Feed](/feed.xml), which also looks tidy and explains what RSS is - pretty neat, no?
  - type: items
    collection: news
    image_aspect_ratio: "4/3"
---
