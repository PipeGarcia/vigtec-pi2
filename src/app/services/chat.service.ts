import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatService {

  constructor(private http: Http) { }

  initChat(message) {
    return this.http.post('/articles/initChatbot', message)
      .map(res => res.json());
  }

  getDocumentList(message) {
    return this.http.get('/articles/getDocumentList', message)
      .map(res => res.json());
  }

  getDocumentsPerAnio(message) {
    return this.http.post('/articles/getDocsPerYear', message)
      .map(res => res.json());
  }

  getFilteredDocs() {
    return this.http.get('/articles/getFilteredDocs')
      .map(res => res.json());
  }

  getDocsPerAnioForStatistics(message) {
    return this.http.post('/articles/getDocumentsPerYear', message)
      .map(res => res.json());
  }

  getDocumentsPerAuthor() {
    return this.http.get('/articles/getDocsPerAuthor')
      .map(res => res.json());
  }

}
