import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const storageKey = 'siae_token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    localStorage.removeItem(storageKey);
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setUser stores user and token is derived', () => {
    const user = { accessToken: 'abc123', fullName: 'Test User', roles: ['User'] } as any;
    service.setUser(user);
    expect(localStorage.getItem(storageKey)).toBeTruthy();
    expect(service.token).toBe('abc123');
  });

  it('logout clears storage and resets user', () => {
    const user = { accessToken: 't', fullName: 'X' } as any;
    service.setUser(user);
    service.logout();
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(service.user()).toBeNull();
  });
});
