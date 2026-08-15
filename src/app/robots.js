export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/career-form/',
        ],
      },
    ],
    sitemap: 'https://www.codeverza.com/sitemap.xml',
    host: 'https://www.codeverza.com',
  };
}
