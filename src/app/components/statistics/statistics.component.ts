import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  @Input() list;
  doughnutChartLabels = [];
  doughnutChartData = [];

  constructor() { }

  ngOnInit() {
    console.log(this.list);
    for(let i=0; i<this.list.length; i++){
      this.doughnutChartLabels.push('Año publicación - ' + this.list[i].anio);
      this.doughnutChartData.push(this.list[i].nroVeces);
    }
  }

  public doughnutChartType:string = 'doughnut';
 
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

}
