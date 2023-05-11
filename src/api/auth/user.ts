import { getRequest } from "@/utils/service"
import { UserInfoDto } from "@/api/auth/types";

/**
 * 获取当前用户的信息
 */
export const userInfoForMe = () => {
  return getRequest<UserInfoDto>("/auth/user/info/me")
}
