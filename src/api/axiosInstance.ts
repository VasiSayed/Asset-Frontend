import axios from "axios";
import { refreshAccessToken, getAuthState } from "../services/loginService";

const AccountURL = "http://127.0.0.1:8000";
const AssetURL = "http://127.0.0.1:8001";


const AccountInstance = axios.create({
  baseURL: `${AccountURL}/api`,
  headers: { "Content-Type": "application/json" },
});

const AssetInstance = axios.create({
  baseURL: `${AssetURL}/api`,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

const sub = (cb: (t: string | null) => void) => queue.push(cb);
const flush = (t: string | null) => {
  queue.forEach((cb) => cb(t));
  queue = [];
};


function attachAuthInterceptors(instance: any) {
  instance.interceptors.request.use((config: any) => {
    const token = getAuthState()?.access_token;
    console.log(token,'this si the acces otken');
    
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (r: any) => r,
    async (error: any) => {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      const original = error.config;

      if (
        (status === 401 || status === 403) &&
        detail === "Token expired." &&
        !original._retry
      ) {
        original._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshAccessToken(); // cookie-based refresh
          isRefreshing = false;
          flush(newToken);
        }

        return new Promise((resolve, reject) => {
          sub((newToken) => {
            if (newToken) {
              original.headers = original.headers ?? {};
              (original.headers as any).Authorization = `Bearer ${newToken}`;
              resolve(instance(original));
            } else reject(error);
          });
        });
      }

      return Promise.reject(error);
    }
  );
}

attachAuthInterceptors(AccountInstance);
attachAuthInterceptors(AssetInstance);


export { AccountInstance, AssetInstance };
