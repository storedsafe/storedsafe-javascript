export * from "./api/storedsafe.types";
export * from "./drivers/request-driver.types";
import { StoredSafe, LoginType } from "./api/storedsafe";
export { LoginType };
import { FetchDriver } from "./drivers/fetch-driver";
export { FetchDriver };
export { StoredSafe };

StoredSafe.default_driver = new FetchDriver();
