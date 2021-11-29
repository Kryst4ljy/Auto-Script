const axios = require("axios");

class HttpRequest {
  getInsideConfig() {
    const config = {
      baseURL: "",
      headers: {},
      method: "post", //  默认请求方式为post,其他方式需调request时另写
    };
    return config;
  }
  interceptors(instance) {
    // 请求拦截
    instance.interceptors.request.use((error) => {
      return Promise.reject(error);
    });
    // 响应拦截
    instance.interceptors.response.use(
      (res) => {
        const { data, status, config } = res;
        return data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  request(options) {
    const instance = axios.create();
    options = Object.assign(this.getInsideConfig(), options);
    // this.interceptors(instance);
    return instance(options);
  }
}

module.exports = HttpRequest;
