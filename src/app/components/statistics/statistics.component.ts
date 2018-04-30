import { ChatService } from './../../services/chat.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  @Input() list;
  @Output() anio = new EventEmitter<string>();
  @Input() isAuthor: boolean;
  doughnutChartLabels = [];
  doughnutChartData = [];
  showDoughnut = false;

  constructor(public chatService: ChatService) { }
  ngOnInit() {
    if(this.isAuthor) {
      this.showDoughnut = true;
    } else {
      this.showDoughnut = false;
    }
    console.log(this.list);
    this.getDataToShow();
  }

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[] = [];
  barChartType: string = 'bar';
  barChartLegend: boolean = true;

  barChartData: any[] = [
    { data: [], label: 'Cantidad de documentos por año' }
  ];

  getDataToShow() {
    console.log('booleanooooo' + this.isAuthor);
    for (let i = 0; i < this.list.length; i++) {
      if (!this.isAuthor) {
        console.log('no entro a autor');
        this.barChartLabels.push('Año publicación - ' + this.list[i].anio);
        this.barChartData[0].data.push(this.list[i].nroVeces);
        this.showDoughnut = false;
      } else {
        console.log('entro a autor');
        this.showDoughnut = true;
        this.doughnutChartLabels.push('Autor - ' + this.list[i].author);
        this.doughnutChartData.push(this.list[i].nroVeces);
      }
    }
  }

  public doughnutChartType = 'doughnut';

  public chartClicked(e: any): void {
    console.log(e);
    let anio;
    if (e.active.length > 0) {
      if (!this.isAuthor) {
        anio = this.barChartLabels[e.active[0]._index].split('-');
      } else {
        anio = this.doughnutChartLabels[e.active[0]._index].split('-');
      }
      const anioFinal = anio[1];
      console.log(anioFinal);
      this.anio.emit(anioFinal);
    }

  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
