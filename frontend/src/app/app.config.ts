import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptor/auth-interceptor';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withDebugTracing()),
    provideEnvironmentNgxMask(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId, {
              prompt: 'select_account' 
            })
          }
        ],
        onError: (err) => {
          console.error('Erro no Google Social Login:', err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};
