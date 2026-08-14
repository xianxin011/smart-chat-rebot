import Axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const baseUrl = "/api";
export const axios = Axios.create({
  baseURL: baseUrl,
});

axios.defaults.headers.post["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.interceptors.request.use(authRequestInterceptor);

async function authResponseInterceptor(response) {
  return response.data;
}
async function authRequestInterceptor(config) {
  return config;
}

async function handleTokenInvalid(data, extra) {
  return data;
}

async function post(url, data, config) {
  return axios.post(url, data, config).then((data) => {
    return handleTokenInvalid(data, {
      data: data,
      url: url,
    });
  });
}
async function get(url, data, config) {
  return axios.get(url, data, config).then((data) => {
    return handleTokenInvalid(data, {
      data: data,
      url: url,
    });
  });
}
async function upload(url, file, config) {
  const { data, name, params } = file;
  if (data) {
    const formData = new FormData();
    formData.append(name || "file", data || "undefined");
    for (const key in params) {
      if (Object.hasOwnProperty.call(params, key)) {
        const element = params[key];
        formData.append(key, element);
      }
    }
    data = formData;
  }
  return post(url, data);
}
export const api = {
  get,
  post,
  upload,
};
