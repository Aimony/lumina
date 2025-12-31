/**
 * 搜索索引 IndexedDB 缓存管理
 *
 * 使用 IndexedDB 持久化存储搜索索引，避免重复加载
 */

const DB_NAME = 'lumina-search-cache'
const DB_VERSION = 1
const STORE_NAME = 'search-index'

export interface SearchIndexCache {
  version: string // 索引版本哈希
  data: unknown[] // 索引数据
  lastUpdated: number // 最后更新时间戳
}

let dbInstance: IDBDatabase | null = null

/**
 * 打开数据库连接
 */
async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'version' })
      }
    }
  })
}

/**
 * 获取缓存的索引数据
 */
export async function getCachedIndex(version: string): Promise<SearchIndexCache | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(version)

      request.onerror = () => reject(new Error('Failed to get cached index'))
      request.onsuccess = () => resolve(request.result || null)
    })
  } catch (error) {
    console.warn('IndexedDB get error:', error)
    return null
  }
}

/**
 * 获取任意版本的缓存（用于检查是否有旧缓存需要清理）
 */
export async function getAnyCachedIndex(): Promise<SearchIndexCache | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.openCursor()

      request.onerror = () => reject(new Error('Failed to get cached index'))
      request.onsuccess = () => {
        const cursor = request.result
        resolve(cursor ? cursor.value : null)
      }
    })
  } catch (error) {
    console.warn('IndexedDB get error:', error)
    return null
  }
}

/**
 * 保存索引到缓存
 */
export async function setCachedIndex(cache: SearchIndexCache): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      // 先清除旧数据
      store.clear()

      // 写入新数据
      const request = store.put(cache)

      request.onerror = () => reject(new Error('Failed to set cached index'))
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.warn('IndexedDB set error:', error)
  }
}

/**
 * 清除所有缓存
 */
export async function clearCachedIndex(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(new Error('Failed to clear cached index'))
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.warn('IndexedDB clear error:', error)
  }
}

/**
 * 检查 IndexedDB 是否可用
 */
export function isIndexedDBSupported(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}
