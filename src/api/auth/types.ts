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
}
