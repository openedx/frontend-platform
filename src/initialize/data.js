import configureCache from "../auth/LocalForageCache";

const capiConfig = {
    headers: { accept: 'application/json' }
};

export async function getHttpConfig(LMS_BASE_URL) {
    // url something like https://{LMS_BASE_URL}/api/v1/mfe-settings
    // now use mock api
    const apiService = await configureCache()
    const url = `http://localhost:3000/config/${LMS_BASE_URL}`;
    const { data } = await apiService.get(url, capiConfig);
    return data;
}
