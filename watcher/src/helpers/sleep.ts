export const sleep = (ms: number): Promise<unknown> => {
  return new Promise((res) => setTimeout(res, ms))
}
