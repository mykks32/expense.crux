import { RequestUser } from '../interfaces/request-user.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- must be an interface (not a type alias) to merge with Express's own declaration.
    interface User extends RequestUser {}
  }
}

export {};
