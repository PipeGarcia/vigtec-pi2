import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;

  constructor(private http:Http) { }

  // Reemplazar esta url en los 3 metodos --> https://vigtec.herokuapp.com
  // Ejemplo: https://vigtec.herokuapp.com/users/register

  registerUser(user){
    const headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post('https://vigtec.herokuapp.com/users/register', user,{headers: headers})
      .map(res => res.json());
  }

  authenticateUser(user){
    const headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post('https://vigtec.herokuapp.com/users/authenticate', user,{headers: headers})
      .map(res => res.json());
  }

  getProfile() {
    const headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    return this.http.get('https://vigtec.herokuapp.com/users/profile', {headers: headers})
      .map(res => res.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired('id_token');
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}
