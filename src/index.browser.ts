export * from '.'
import { StoredSafe } from './api/storedsafe'
import { FetchDriver } from './drivers/fetch-driver'
export { FetchDriver }

StoredSafe.default_driver = new FetchDriver()