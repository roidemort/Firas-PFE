import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { forkJoin } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';

import { LaboService } from '../../../../core/services/labo.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ChartOptionsBar } from '../../../../shared/models/chart-options';

@Component({
  selector: 'app-labo-course-details',
  standalone: true,
  imports: [NgIf, LoaderComponent, NgApexchartsModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
})
export class LaboCourseDetailsComponent implements OnInit {
  isLoading = false;
  course = signal<any>(null);
  kpis = signal<any>(null);
  chapterFunnel = signal<any[]>([]);
  funnelChartOptions: Partial<ChartOptionsBar> | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private laboService: LaboService) {}

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.router.navigate(['/labo/dashboard/courses']);
      return;
    }

    this.loadDetails(courseId);
  }

  loadDetails(courseId: string) {
    this.isLoading = true;
    forkJoin({
      details: this.laboService.getMyCourseDetails(courseId),
      analytics: this.laboService.getMyCourseAnalytics(courseId),
    }).subscribe({
      next: (res) => {
        if (!res.details.status || !res.analytics.status) {
          this.isLoading = false;
          toast.warning(res.details.message || res.analytics.message || 'Impossible de charger la formation');
          return;
        }

        this.course.set(res.details.data.course);
        this.kpis.set(res.analytics.data.kpis || null);
        const funnel = res.analytics.data.chapterFunnel || [];
        this.chapterFunnel.set(funnel);
        this.funnelChartOptions = this.buildFunnelChart(funnel);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        toast.error('Erreur lors du chargement du detail de formation');
      },
    });
  }

  private buildFunnelChart(chapterFunnel: any[]): Partial<ChartOptionsBar> | null {
    if (!chapterFunnel.length) {
      return null;
    }

    return {
      series: [
        {
          name: 'Commence',
          data: chapterFunnel.map((item) => Number(item.startedCount || 0)),
        },
        {
          name: 'Termine',
          data: chapterFunnel.map((item) => Number(item.completedCount || 0)),
        },
      ],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '58%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['transparent'],
      },
      xaxis: {
        categories: chapterFunnel.map((item) => item.sectionTitle),
      },
      yaxis: {
        title: {
          text: 'Chapitres',
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} inscrits`,
        },
      },
      colors: ['#0284c7', '#16a34a'],
      title: {
        text: 'Entonnoir progression par chapitre',
        align: 'left',
      },
      subtitle: {
        text: '',
      },
    };
  }

  backToCourses() {
    this.router.navigate(['/labo/dashboard/courses']);
  }
}
