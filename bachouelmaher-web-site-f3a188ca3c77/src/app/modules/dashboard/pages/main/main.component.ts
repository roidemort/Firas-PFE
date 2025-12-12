import { Component, OnInit } from '@angular/core';
import {UsersService} from "../../../../core/services/users.service";
import {toast} from "ngx-sonner";
import {NgClass, NgIf} from "@angular/common";
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartOptions,
  ChartOptionsBar,
  ChartOptionsCustom,
  ChartOptionsCustomPie
} from 'src/app/shared/models/chart-options';
@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    standalone: true,
  imports: [
    NgIf,
    NgApexchartsModule,
    NgClass
  ],
})



export class MainComponent  implements OnInit{
  public chartOptions!: Partial<ChartOptions>;
  public chartOptions2!: Partial<ChartOptions>;
  public chartOptions4!: Partial<ChartOptionsCustomPie>;
  public chartOptions6!: Partial<ChartOptionsCustomPie>;
  public chartOptions3!: Partial<ChartOptionsCustom>;
  public chartOptions5!: Partial<ChartOptionsBar>;
  dashboardDetails: any

  constructor(private usersService: UsersService) {
    this.usersService.getMainDashboardDetails().subscribe({
      next: (result) => {
        this.dashboardDetails = result.data
      },
      error: (error) => this.handleRequestError(error),
    });

    this.chartOptions = {
      series: [],
      chart: {
      height: 350,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: 5,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },

    xaxis: {
      categories: ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"],
      position: 'top',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      }

    },
    title: {
      text: 'Nbr membres/mois',
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
        color: '#274848'
      }
    }
    };

    this.chartOptions2 = {
      series: [],
      chart: {
      height: 350,
      type: 'line',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: 5,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    xaxis: {
      categories: ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"],
      position: 'top',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      }

    },
    title: {
      text: 'Nbr abonnements/mois',
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
       color: '#274848'
      }
    }
    };

    this.chartOptions3 = {
      series: [
        {
          name: "Session Duration",
          data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10]
        },
        {
          name: "Page Views",
          data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35]
        },
        {
          name: "Total Visits",
          data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47]
        }
      ],
      chart: {
        height: 350,
        type: "line"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 5,
        curve: "straight",
        dashArray: [8, 5]
      },
      title: {
        text: "% de progression des formations",
        align: "left"
      },
      legend: {
        tooltipHoverFormatter: function(val, opts) {
          return (
            val +
            " - <strong>" +
            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
            "</strong>"
          );
        }
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        labels: {
          trim: false
        },
        categories: ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"],
      },
      tooltip: {
        y: [
          {
            title: {
              formatter: function(val: any) {
                return 'Formations sont démarrées';
              }
            }
          },
          {
            title: {
              formatter: function(val: any) {
                return 'Formations sont clôturées.';
              }
            }
          }
        ]
      },
      grid: {
        borderColor: "#f1f1f1"
      }
    };

    this.chartOptions4 = {
      series: [44, 55, 13],
      chart: {
        width: 450,
        type: "pie"
      },
      title: {
        text: "Inscrire des cours par catégorie",
        margin:10,
      },
      labels: ["Pas commencé", "En cours","Terminé"],
    };

    this.chartOptions5 = {
      series: [
        {
          data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
        }
      ],
      chart: {
        type: "bar",
        height: 380
      },
      plotOptions: {
        bar: {
          barHeight: "100%",
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: "bottom"
          }
        }
      },
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#fff"]
        },
        formatter: function(val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        offsetX: 0,
        dropShadow: {
          enabled: true
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: [
          "South Korea",
          "Canada",
          "United Kingdom",
          "Netherlands",
          "Italy",
          "France",
          "Japan",
          "United States",
          "China",
          "India"
        ]
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      title: {
        text: "Formations les plus populaires",
        margin:10,
      },
      subtitle: {
        text: "Nom de formation sous forme d'étiquettes de données à l'intérieur des barres",
        align: "center"
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function() {
              return "";
            }
          }
        }
      }
    };

    this.chartOptions6 = {
      title: {
        text: "Type de cours par abonnés",
        margin:10,
      },
      series: [44, 55, 13, 43, 22],
      chart: {
        type: "donut"
      },
      labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

  }

  ngOnInit(): void {}

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }
}
