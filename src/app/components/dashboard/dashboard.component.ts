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
  grupo1 = [];
  grupo2 = [];
  grupo3 = [];
  mostrarAgrupacion = false;
  listaPalabras = '';
  mostrarPalabras = false;
  indice;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
  }

  initChat(mensaje) {
    this.mostrarAgrupacion = false;
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
        /*this.messages.push({ 'sentBy': 'user', 'content': this.sentMessage },
          { 'sentBy': 'bot', 'content': this.receivedMessage });*/
      }, error => console.log(error)
    );
  }

  getDocumentsPerAnio(mensaje) {
    this.mostrarAgrupacion = false;
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

  getAllDocuments(mensaje) {
    const json = { 'mensaje': mensaje };
    this.chatService.getAllDocuments(json).subscribe(res => {
      console.log(res);
      this.organizarListasDeDocumentos(res);
      this.mostrarAgrupacion = true;
    }, error => console.log(error));
  }

  buscarPorPalabra(palabra) {
    console.log(palabra);
  }

  organizarListasDeDocumentos(json) {
    const data0 = json.data.elemento0.elementos;
    const data1 = json.data.elemento1.elementos;
    const data2 = json.data.elemento2.elementos;

    for (var i in data0) {
      this.grupo1.push({ 'nombre': data0[i].nombre, 'anio': data0[i].anio , 'link': data0[i].link});
    }

    for (var i in data1) {
      this.grupo2.push({ 'nombre': data1[i].nombre, 'anio': data1[i].anio, 'link':data1[i].link});
    }

    for (var i in data2) {
      this.grupo3.push({ 'nombre': data2[i].nombre, 'anio': data2[i].anio, 'link': data2[i].link });
    }
  }

  onNavigate(link) {
    window.open(link, '_blank');
  }

  mostrarPalabrasClaves(i) {
    this.indice = i;
    this.mostrarPalabras = !this.mostrarPalabras;
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.getDocumentsPerAnio(this.sentMessage);
    }
  }

}