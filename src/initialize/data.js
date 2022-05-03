import configureCache from "../auth/LocalForageCache";
import { getConfig } from "../config";

const apiConfig = {
    headers: { accept: 'application/json' }
};


export async function getHttpConfig(LMS_BASE_URL) {
    // url something like https://{LMS_BASE_URL}/api/v1/mfe-settings
    const apiService = await configureCache();
    const url = getConfig().ENVIRONMENT == "development" ? `http://${LMS_BASE_URL}:8000/eox-tenant/api/v1/mfe-api/` : `https://${LMS_BASE_URL}eox-tenant/api/v1/mfe-api/${LMS_BASE_URL}`;
    const { data } = await apiService.get(url, apiConfig);
    return data;
}
