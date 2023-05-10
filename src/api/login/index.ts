import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "login/code",
    method: "get",
  })
}

/**
 * 登出操作
 */
export const logoutRequest = () => {
  return request({
    url: "logout",
    method: "post",
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.ILoginRequestData) {
  return request<Login.LoginTokenData>({
    url: "login",
    method: "post",
    data,
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "users/info",
    method: "get",
  })
}
