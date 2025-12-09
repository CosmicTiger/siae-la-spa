import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../service/auth.service';
import { of } from 'rxjs';

describe('LoginComponent (standalone)', () => {
  let fixture: any;
  let comp: LoginComponent;
  let auth: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    comp = fixture.componentInstance;
    auth = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create component and form invalid initially', () => {
    expect(comp).toBeTruthy();
    expect(comp.loginForm.invalid).toBeTrue();
  });

  it('should call authService.login on submit with valid data', () => {
    spyOn(auth, 'login').and.returnValue(of(true));
    comp.loginForm.setValue({ email: 'a@b.com', password: 'secret' });
    comp.loginOnSubmit();
    expect(auth.login).toHaveBeenCalled();
  });
});
