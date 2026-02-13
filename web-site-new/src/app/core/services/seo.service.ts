import {Inject, Injectable} from '@angular/core';
import {Title, Meta, MetaDefinition} from '@angular/platform-browser';
import {environment, environment as env} from "../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {DOCUMENT} from '@angular/common';
import {SortConfig} from "../models/config.model";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    @Inject(DOCUMENT) private doc: any,
    private title: Title, private meta: Meta, private http: HttpClient) {
  }

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateMetaTags(metaTags: MetaDefinition[]) {
    metaTags.forEach(m => this.meta.updateTag(m));
  }

  getSeoData(permalink: string | undefined) {
    const data = {
      permalink
    }
    return this.http.post<any>(`${env.apiEndpoint}/seo`, data);
  }

  setSeoData(path: string | undefined){
    this.getSeoData(path).subscribe(response => {
      if (response && response.data && response.data.title && response.data.metaTags) {
        this.updateTitle(response.data.title);
        const robot = { name :"robots", content : response.data.robots };
        const newData = [robot, ...response.data.metaTags]
        this.updateMetaTags(newData);
        this.createLinkForCanonicalURL();
      }
    });
  }

  createLinkForCanonicalURL() {
    let elm = this.doc.getElementById('canonicalId');
    if (elm) {
      this.doc.head.removeChild(elm);
    }
    let link: HTMLLinkElement = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('id', 'canonicalId');
    this.doc.head.appendChild(link);
    link.setAttribute('href', this.doc.URL);
  }

  getAllSEOs(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'metaTags');
    if(text) params = params.append('text', `title,permalink:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/seo`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

  updateSeo(seoId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/seo/edit/${seoId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  addSeo(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/seo/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  getSeoDetails(pharmacyId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/seo/getDetails/${pharmacyId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}
