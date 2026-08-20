jest.mock('notion-client', () => ({
  NotionAPI: jest.fn(() => ({
    getPage: jest.fn()
  }))
}))

jest.mock('@/blog.config', () => ({
  API_BASE_URL: 'https://www.notion.so/api/v3',
  NOTION_ACTIVE_USER: null,
  NOTION_TOKEN_V2: null
}))

jest.mock('@/lib/db/notion/RateLimiter', () => ({
  RateLimiter: jest.fn(() => ({
    enqueue: jest.fn((key, execute) => execute())
  }))
}))

import notionAPI from '@/lib/db/notion/getNotionAPI'
import { NotionAPI as mockNotionConstructor } from 'notion-client'

describe('getNotionAPI', () => {
  it('adds a browser User-Agent to notion-client requests', async () => {
    const mockGetPage = jest.fn().mockResolvedValue({ recordMap: {} })
    mockNotionConstructor.mockImplementationOnce(() => ({
      getPage: mockGetPage
    }))

    await notionAPI.getPage('page-id')

    expect(mockNotionConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        ofetchOptions: {
          headers: {
            'User-Agent': expect.stringContaining('Mozilla/5.0')
          }
        }
      })
    )
    expect(mockGetPage).toHaveBeenCalledWith('page-id')
  })
})
