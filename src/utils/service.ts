import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get } from "lodash-es"
import { getToken } from "./cache/cookies"

/** 创建请求实例 */
function createService() {
  // 创建一个 Axios 实例
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error),
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      // apiData 是 API 返回的数据
      const apiData = response.data as any
      // 这个 Code 是和后端约定的业务 Code
      const code = apiData.code
      // 如果没有 Code, 代表这不是项目后端开发的 API
      if (code === undefined) {
        ElMessage.error("非本系统的接口")
        return Promise.reject(new Error("非本系统的接口"))
      } else {
        switch (code) {
          case 1:
            // 代表没有错误
            return apiData
          default:
            // 不是正确的 Code
            ElMessage.error(apiData.msg || "Error")
            return Promise.reject(new Error("Error"))
        }
      }
    },
    (error) => {
      // Status 是 HTTP 状态码
      const status = get(error, "response.status")
      const url = get(error, "config.url")
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          // Token 过期时，直接退出登录并强制刷新页面（会重定向到登录页）
          useUserStoreHook().logout()
          location.reload()
          break
        case 403:
          error.message = "拒绝访问"
          break
        case 404:
          error.message = `未找到请求路径：/${url}`
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
        default:
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    },
  )
  return service
}

/** 创建请求方法 */
function createRequestFunction(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const configDefault = {
      headers: {
        // 携带 Token
        Authorization: getToken(),
        "Content-Type": get(config, "headers.Content-Type", "application/json"),
      },
      timeout: 5000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {},
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于网络请求的实例 */
export const service = createService()
/** 用于网络请求的方法 */
export const request = createRequestFunction(service)

/**
 * get请求
 * @param url 请求路径
 * @param params 请求参数
 */
export function getRequest<T>(url: string, params?: any) {
  return request<JsonReposeData<T>>({
    url,
    method: "get",
    params,
  })
}

export function postRequest<T>(url: string, data?: any, params?: any) {
  return request<JsonReposeData<T>>({
    url,
    method: "post",
    params,
    data,
  })
}

export function deleteRequest<T>(url: string, data?: any, params?: any) {
  return request<JsonReposeData<T>>({
    url,
    method: "delete",
    params,
    data,
  })
}
export function putRequest<T>(url: string, data?: any, params?: any) {
  return request<JsonReposeData<T>>({
    url,
    method: "put",
    params,
    data,
  })
}
