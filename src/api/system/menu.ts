import { getRequest, postRequest, putRequest } from "@/utils/service";

export function tree(id: number) {
  return getRequest<MenuTreeData>("/inner/menu/tree", id)
}

export function treeList(query: MenuTreeListQuery) {
  return getRequest<MenuTreeData[]>("/inner/menu/treeList", query)
}

export function updateData(data: MenuAddOrUpdateData) {
  return putRequest<boolean>("/inner/menu", data)
}

export function addData(data: MenuAddOrUpdateData  ) {
  return postRequest<boolean>("/inner/menu", data)
}


// --- 下面是类型定义 ---
interface MenuTreeListQuery {
  parentId?: number
  name?: string
  router?: string
}

export interface MenuAddOrUpdateData {
  parentId?: number
  name: string
  router: string
  id?:number
}




/**
 * MenuTreeData : 菜单树数据
 */
export interface MenuTreeData {
  children: MenuTreeData [];
  /**
   * 创建者ID
   */
  createdBy?: number;
  /**
   * 创建时间
   */
  createdTime: Date;
  /**
   * 数据ID
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 上级菜单ID
   */
  parentId?: number | null;
  /**
   * 路由路径
   */
  router: string;
  /**
   * 更新者ID
   */
  updatedBy?: number;
  /**
   * 更新时间
   */
  updatedTime: Date;
}

export interface MenuUpdateData {
  /*
  * 数据ID
  */
  id: number;
  /**
   * 菜单名
   */
  name: string;
  /**
   * 上级菜单id
   */
  parentId?: number;
  /**
   * 前端路径
   */
  router: string;
}

export interface MenuAddData {
  /**
   * 菜单名
   */
  name: string;
  /**
   * 上级菜单id
   */
  parentId?: number;
  /**
   * 前端路径
   */
  router: string;
}
