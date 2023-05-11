/** 所有 api 接口的响应数据都应该准守该格式 */
interface IApiResponseData<T> {
  code: number
  data: T
  message: string
}

/** Json格式响应统一包装类 */
interface JsonReposeData<T> {
  code: number
  data?: T
  msg: string
}

/**
 * spring-data 通用分页包装类
 */
interface PageWrapper<T> {
  content?: T[];
  totalElements?: number;
  /**
   * 分页信息
   */
  pageable?: PageableObject;
}

interface PageableObject {
  // offset?: number;
  // paged?: boolean;
  /**
   * 页码
   */
  pageNumber?: number;
  /**
   * 页面大小
   */
  pageSize?: number;
  // sort?: SortObject;
  // unpaged?: boolean;
}

/**
 * 数据ID列表。
 *
 * 通常用在多个删除操作。
 */
interface DataIds {
  ids: number[]
}
