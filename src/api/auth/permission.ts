import { deleteRequest, getRequest, postRequest, putRequest } from "@/utils/service";
import { PermissionInfo, PermissionPageQuery } from "@/api/auth/types";

export const addData = (data: PermissionInfo) => {
  return postRequest<boolean>("/auth/permission", data)
}
export const updateData = (data: PermissionInfo) => {
  return putRequest<boolean>("/auth/permission", data)
}
export const pageQuery = (params: PermissionPageQuery) => {
  return getRequest<PageWrapper<PermissionInfo>>("/auth/permission/page", params)
}
export const checkCodeExist = (code: string, notId?: number) => {
  return getRequest<boolean>("/auth/permission/exist", { code, notId })
}
export const deleteByIds = (ids: number[]) => {
  return deleteRequest<boolean>("/auth/permission", { ids })
}
export const allData = () => {
  return getRequest<PermissionInfo[]>("/auth/permission/all")
}
