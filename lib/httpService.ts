import axios, { type AxiosInstance, type AxiosRequestHeaders } from 'axios';
import { destroySession, getSession } from './auth';

const authAxios = (): AxiosInstance => {
    const instance = axios.create({
        timeout: 25000,
    });

    instance.interceptors.request.use(
        async (config) => {
            const session = await getSession();
            config.headers = {
                'Content-Type': 'application/json',
                Accept: '*/*',
                bundee_auth_token: session.authToken || process.env.FALLBACK_BUNDEE_AUTH_TOKEN,
            } as unknown as AxiosRequestHeaders;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    // Interceptor to handle 401 errors
    instance.interceptors.response.use(
        (response) => response, // Process response with handleResponse function
        async (error) => {
            if (error.response && error.response.status === 401) {
                await destroySession(); // Call logout function
            }
            return Promise.reject(error);
        },
    );

    return instance;
};

// HTTP requests
export const http = {
    post: (url: string, data?: any, config?: any) => authAxios().post(url, data, config),
    get: (url: string, config?: any) => authAxios().get(url, config),
    delete: (url: string, config?: any) => authAxios().delete(url, config),
    put: (url: string, data?: any, config?: any) => authAxios().put(url, data, config),
};

// Function to handle response
export const handleResponse = (response: any) => {
    const codes = response.codes || [];
    const successCode = codes.find((code: any) => code.key === 'SUCCESS');
    if (successCode.key === 'SUCCESS' && response.errorCode == 0) {
        return { success: true, data: response, message: response.errorMessage };
    }
    if (response.errorCode == '1') {
        return { success: false, data: null, message: response.errorMessage };
    }
    const errorCodes = codes.map((code: any) => code.key).join(', ');
    return { success: false, data: null, message: `Error: ${errorCodes}` };
};
