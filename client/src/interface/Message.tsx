export interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: number;
  notification?: boolean;
}
