import { Component, OnInit, TemplateRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  modalRef: BsModalRef;
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
  grupo4 = [];
  mostrarAgrupacion = false;
  listaPalabras = '';
  mostrarPalabras = false;
  indice;
  selectedYear = '2018';
  years = ['2018', '2017', '2016', '2015', '2014', '2013', '2012',
    '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004',
    '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996',
    '1995', '1994', '1993', '1992', '1991', '1990'];
  tipoBusqueda = 'simple';
  palabrasAAgrupar = [];

  constructor(private chatService: ChatService, private modalService: BsModalService) { }

  ngOnInit() {
  }

  initChat(mensaje, template: TemplateRef<any>) {
    this.sentMessage = '';
    this.tipoBusqueda = 'simple';
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
        if(this.query.nombreDocumento.length === 0) {
          this.openModal(template);
        }
        this.algo = res.algo;
      }, error => console.log(error)
    );
  }

  getDocumentsPerAnio(mensaje, template: TemplateRef<any>, template2: TemplateRef<any>) {
    if (!this.sentMessage.trim()) {
      this.openModal(template);
    } else {
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
          if (this.tipoBusqueda === 'avanzada') {
            this.initChat(this.selectedYear, template2);
          }
        }, error => { console.log('error'); }
      );
    }
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

  getAllDocuments(template: TemplateRef<any>) {
    if (!this.listaPalabras) {
      this.openModal(template);
    } else {
      let listaFinal = [];
      this.palabrasAAgrupar = this.listaPalabras.split('-');
      this.palabrasAAgrupar.forEach((x) => {
        listaFinal.push(x.toLowerCase());
      });
      this.listaPalabras = '';
      const json = { 'mensaje': listaFinal };
      this.grupo1 = [];
      this.grupo2 = [];
      this.grupo3 = [];
      this.chatService.getAllDocuments(json).subscribe(res => {
        console.log(res);
        this.organizarListasDeDocumentos(res);
        this.mostrarAgrupacion = true;
      }, error => console.log(error));
    }
  }

  buscarPorPalabra(palabra) {
    console.log(palabra);
  }

  organizarListasDeDocumentos(json) {
    const data0 = json.data.elemento0.elementos;
    const data1 = json.data.elemento1.elementos;
    const data2 = json.data.elemento2.elementos;
    const data3 = json.data.elemento3.elementos;

    for (var i in data0) {
      this.grupo1.push({ 'nombre': data0[i].nombre, 'anio': data0[i].anio, 'link': data0[i].link });
    }

    for (var i in data1) {
      this.grupo2.push({ 'nombre': data1[i].nombre, 'anio': data1[i].anio, 'link': data1[i].link });
    }

    for (var i in data2) {
      this.grupo3.push({ 'nombre': data2[i].nombre, 'anio': data2[i].anio, 'link': data2[i].link });
    }

    for (var i in data3) {
      this.grupo4.push({ 'nombre': data3[i].nombre, 'anio': data3[i].anio, 'link': data3[i].link });
    }
  }

  onNavigate(link) {
    window.open(link, '_blank');
  }

  mostrarPalabrasClaves(i) {
    this.indice = i;
    this.mostrarPalabras = !this.mostrarPalabras;
  }

  keyDownFunction(event, template: TemplateRef<any>, template2: TemplateRef<any>) {
    if (event.keyCode === 13) {
      this.getDocumentsPerAnio(this.sentMessage, template, template2);
    }
  }

  agregarPalabraAAgrupar(palabra) {
    if (this.listaPalabras.length === 0) {
      this.listaPalabras = palabra;
    } else {
      this.listaPalabras = this.listaPalabras + '-' + palabra;
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

}
