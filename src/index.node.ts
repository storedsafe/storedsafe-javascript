export * from '.'
import { StoredSafe } from './api/storedsafe'
import { NodeDriver } from './drivers/node-driver'
export { NodeDriver }

StoredSafe.default_driver = new NodeDriver()
