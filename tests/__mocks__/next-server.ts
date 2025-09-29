// Mock for next/server in tests

export class NextRequest {
  public url: string
  public method: string
  public headers: Map<string, string>
  private _body: string

  constructor(url: string, init?: RequestInit) {
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Map()
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value as string)
      })
    }
    
    this._body = init?.body as string || ''
  }

  async text(): Promise<string> {
    return this._body
  }

  async json(): Promise<any> {
    return JSON.parse(this._body)
  }
}

export class NextResponse {
  public status: number
  public headers: Map<string, string>
  private _body: string

  constructor(body?: string, init?: ResponseInit) {
    this._body = body || ''
    this.status = init?.status || 200
    this.headers = new Map()
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value as string)
      })
    }
  }

  async text(): Promise<string> {
    return this._body
  }

  async json(): Promise<any> {
    return JSON.parse(this._body)
  }

  static json(data: any, init?: ResponseInit): NextResponse {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })
  }
} 