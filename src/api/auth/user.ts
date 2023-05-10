import { request } from "@/utils/service"
import { UserInfoDto } from "@/api/auth/types";

/**
 * 获取当前用户的信息
 */
export const userInfoForMe = () => {
  return request<JsonReposeData<UserInfoDto>>({
    url: "/auth/user/info/me",
    method: "get",
  })
}
