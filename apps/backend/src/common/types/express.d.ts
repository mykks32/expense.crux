import { RequestUser } from '../interfaces/request-user.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends RequestUser {}
  }
}

export {};
