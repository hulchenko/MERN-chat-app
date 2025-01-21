interface BaseResponse {
  error: boolean;
  message: string;
}

interface AuthResponse extends BaseResponse {
  token: string;
}

interface RoomResponse extends BaseResponse {
  data: any;
}

export type { AuthResponse, RoomResponse };
