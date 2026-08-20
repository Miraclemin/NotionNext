jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getPage: jest.fn()
  }
}))

jest.mock('@/lib/cache/cache_manager', () => ({
  getDataFromCache: jest.fn(),
  getOrSetDataWithCache: jest.fn((key, loader) => loader())
}))

jest.mock('p-limit', () => () => execute => execute())

import { getPageWithRetry } from '@/lib/db/notion/getPostBlocks'
import notionAPI from '@/lib/db/notion/getNotionAPI'
import { getDataFromCache } from '@/lib/cache/cache_manager'

describe('getPageWithRetry', () => {
  it('throws after the final retry instead of returning empty data', async () => {
    const notionError = new Error('403 Forbidden')
    notionAPI.getPage.mockRejectedValue(notionError)
    getDataFromCache.mockResolvedValue(null)

    await expect(getPageWithRetry('page-id', 'test', 3)).rejects.toThrow(
      '403 Forbidden'
    )

    expect(notionAPI.getPage).toHaveBeenCalledTimes(3)
  })
})
