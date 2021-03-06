import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest
} from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserToken } from '../../auth/models/token-types.model';
import * as fromStore from '../store';
import { AuthModuleConfig } from '../auth-module.config';

@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {
  userToken: UserToken;
  baseReqString =
    (this.config.server.baseUrl || '') +
    this.config.server.occPrefix +
    this.config.site.baseSite;

  constructor(
    private config: AuthModuleConfig,
    private store: Store<fromStore.AuthState>
  ) {
    this.store
      .pipe(select(fromStore.getUserToken))
      .subscribe((token: UserToken) => {
        this.userToken = token;
      });
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.userToken &&
      request.url.indexOf(this.baseReqString) > -1 &&
      !request.headers.get('Authorization')
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: `${this.userToken.token_type} ${
            this.userToken.access_token
          }`
        }
      });
    }

    return next.handle(request);
  }
}
