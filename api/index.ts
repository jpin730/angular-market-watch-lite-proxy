import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS' || req.method !== 'GET') {
    return res.status(200).end()
  }

  const authorization = req.headers.authorization
  const password = process.env.PASSWORD || 'password'

  if (authorization !== password) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const apiKey = process.env.API_KEY

  if (!apiKey) {
    return res.status(404).json({ error: 'Missing API key or URL' })
  }

  const { path, ...query } = req.query
  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&')
  const url = `https://api.coingecko.com/api/v3${path}?${queryString}`

  const apiResponse = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': apiKey,
    },
  }).then((response) => response.json())

  return res.status(200).json(apiResponse)
}
