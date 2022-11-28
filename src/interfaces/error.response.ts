import { MessageResponse } from './index';

export interface ErrorResponse extends MessageResponse {
  stack?: string;
}
