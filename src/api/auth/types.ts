/**
 * UserInfoDto
 */
export interface UserInfoDto {
  avatar: string;
  email: string;
  id: number;
  roles: string[];
  username: string;
}

/**
 * User
 */
export interface UserPageInfo {
  /**
   * 创建者ID
   */
  createdBy?: number;
  /**
   * 创建时间
   */
  createdTime?: Date;
  /**
   * 数据ID
   */
  id?: number;
  roles: [{ id: number, name: string }];
  /**
   * 更新者ID
   */
  updatedBy?: number;
  /**
   * 更新时间
   */
  updatedTime?: Date;
  username?: string;
}

export interface UserPageQuery extends PageParam {
  username?: string
}

export interface UserAddDto {

  /**
   * 密码
   */
  password: string;
  /**
   * 用户拥有角色ID
   */
  roleIds: number[];

  /**
   * 用户名
   */
  username: string;
}

export interface UserUpdateDto extends UserAddDto {
  id: number
}

export interface UserDetailWithRole {

  id: number
  /**
   * 密码
   */
  password?: string;

  roles: [{ id: number, name: string }]
  /**
   * 用户名
   */
  username: string;
}

export interface UserAddOrUpdateDto extends UserAddDto {
  id?: number
  passwordConfirm?: string
}

/**
 * 重置密码
 */
export interface PwdResetDto {
  id: number
  password: string;
  // oldPassword: string;
  passwordConfirm: string
}

export interface PermissionPageQuery extends PageParam {
  /**
   * 权限名
   */
  name?: string
  code?: string
}

/**
 * Permission
 */
export interface PermissionInfo {
  /**
   * 权限代号
   */
  code?: string;
  /**
   * 创建者ID
   */
  createdBy?: number;
  /**
   * 创建时间
   */
  createdTime?: Date;
  /**
   * 数据ID
   */
  id?: number;
  /**
   * 权限名
   */
  name?: string;
  roleIds?: number[];
  // roles: Role[];
  /**
   * 更新者ID
   */
  updatedBy?: number;
  /**
   * 更新时间
   */
  updatedTime?: Date;
}

/**
 * RoleData
 */
export interface RoleInfo {
  code?: string;
  /**
   * 创建者ID
   */
  createdBy?: number;
  /**
   * 创建时间
   */
  createdTime?: Date;
  /**
   * 数据ID
   */
  id?: number;
  name?: string;
  /**
   * 更新者ID
   */
  updatedBy?: number;
  /**
   * 更新时间
   */
  updatedTime?: Date;

  permissionIds?: number[];
  permissions?: PermissionInfo[];
}
