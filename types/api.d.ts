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
