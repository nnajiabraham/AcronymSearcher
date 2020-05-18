export class HTTPResponseDto<T> {
  constructor(
    private statusCode: number,
    private data: T | null,
    private error: string | null,
  ) {}
}
