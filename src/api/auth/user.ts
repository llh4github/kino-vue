import { getRequest, postRequest, putRequest } from "@/utils/service"
import {
  PwdResetDto,
  UserAddOrUpdateDto,
  UserDetailWithRole,
  UserInfoDto,
  UserPageInfo,
  UserPageQuery,
} from "@/api/auth/types";
import { Md5 } from "ts-md5";

/**
 * 获取当前用户的信息
 */
export const userInfoForMe = () => {
  return getRequest<UserInfoDto>("/auth/user/info/me")
}
export const pageQuery = (query: UserPageQuery) => {
  return getRequest<PageWrapper<UserPageInfo>>("/auth/user/page", query)
}
export const addData = (data: UserAddOrUpdateDto) => {
  const sendData = { ...data }
  sendData.password = Md5.hashStr(data.password)
  sendData.passwordConfirm = undefined
  return postRequest<boolean>("/auth/user", sendData)
}
export const updateData = (data: UserAddOrUpdateDto) => {
  const sendData = { ...data }
  sendData.passwordConfirm = undefined
  return putRequest<boolean>("/auth/user", sendData)
}
export const checkUniqueUsername = (username: string, notId?: number) => {
  return getRequest<boolean>("/auth/user/exist", { username, notId })
}
export const userDetailWithRole = (id: number) => {
  return getRequest<UserDetailWithRole>(`/auth/user/${id}/detail`)
}
export const disableUser = (ids: number[]) => {
  return putRequest<number>("/auth/user/status/disable", { ids })
}
export const enableUser = (ids: number[]) => {
  return putRequest<number>("/auth/user/status", { ids, status: 1 })
}

export const updatePassword = (dto: PwdResetDto) => {
  const { id, password } = dto
  return putRequest<number>("/auth/user/update/pwd", { id, password: Md5.hashStr(password) })
}

