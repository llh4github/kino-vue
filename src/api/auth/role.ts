import { deleteRequest, getRequest, postRequest, putRequest } from "@/utils/service"
import { RoleInfo } from "@/api/auth/types";

export const pageApi = (params?: any) => {
  return getRequest<PageWrapper<RoleInfo>>("/auth/role/page", params)
}
export const deleteRole = (data: DataIds) => {
  return deleteRequest<boolean>("/auth/role", data)
}

export const updateRole = (data: RoleInfo) => {
  return putRequest<boolean>("/auth/role", data)
}
export const createRole = (data: RoleInfo) => {
  return postRequest<boolean>("/auth/role", data)
}
export const checkUniqueCode = (code: string, notId?: number) => {
  return getRequest<boolean>("/auth/role/exist", { code, notId })
}
