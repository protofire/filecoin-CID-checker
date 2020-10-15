export class ErrorStatus extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    Object.setPrototypeOf(this, ErrorStatus.prototype)
    this.status = status
  }
}
