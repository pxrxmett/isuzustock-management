import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformKeys(data)));
  }

  private transformKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformKeys(item));
    }

    if (obj instanceof Date) {
      return obj;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = this.toCamelCase(key);
        result[camelKey] = this.transformKeys(obj[key]);
        return result;
      }, {});
    }

    return obj;
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/gi, (match) => {
      return match.toUpperCase().replace('-', '').replace('_', '');
    });
  }
}
