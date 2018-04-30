import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  posts: any = [];
  sentMessage = '';
  receivedMessage = '';
  messages = [];
  query: any;
  algo: string;
  showSpinner = false;
  showStatistics = false;
  isAuthor = false;
  isAnalyzing = false;
  isSearch = false;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
  }

  initChat(mensaje) {
    this.isAuthor = true;
    this.isAnalyzing = true;
    this.query = [];
    this.showSpinner = true;
    this.showStatistics = false;
    const msg = { 'mensaje': mensaje };
    this.chatService.initChat(msg).subscribe(
      res => {
        this.showSpinner = false;
        this.showStatistics = false;
        this.query = res.query;
        this.algo = res.algo;
        this.receivedMessage = res.botMessage;
        /*this.messages.push({ 'sentBy': 'user', 'content': this.sentMessage },
          { 'sentBy': 'bot', 'content': this.receivedMessage });*/
      }, error => console.log(error)
    );
  }

  getDocumentsPerAnio(mensaje) {
    this.showStatistics = false;
    this.isAnalyzing = false;
    this.query = [];
    this.showSpinner = true;
    const msg = { 'mensaje': mensaje };
    this.chatService.getDocumentsPerAnio(msg).subscribe(
      res => {
        this.isSearch = true;
        this.isAuthor = false;
        this.showSpinner = false;
        this.query = res.query;
        this.algo = res.algo;
        this.receivedMessage = res.botMessage;
        this.messages.push({ 'sentBy': 'user', 'content': this.sentMessage },
          { 'sentBy': 'bot', 'content': this.receivedMessage });
        this.showStatistics = true;
      }, error => { console.log('error'); }
    );
  }

  getFilteredDocs() {
    this.chatService.getFilteredDocs().subscribe(res => {
      console.log(res);
    }, error => console.log(error));
  }

  getDocumentsPerAuthor() {
    this.isAuthor = true;
    this.showSpinner = true;
    this.isSearch = false;
    this.chatService.getDocumentsPerAuthor().subscribe(res => {
      this.showSpinner = false;
      this.showStatistics = true;
      this.query = res.data;
    }, error => console.log(error));
  }

}
