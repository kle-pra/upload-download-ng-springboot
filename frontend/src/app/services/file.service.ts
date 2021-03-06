import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private serverUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }


  upload(files: FileList): Observable<HttpEvent<String[]>> {
    console.log(files);
    const formData = new FormData();

    for (const file of Array.from(files)) {
      formData.append('files', file, file.name)
    }

    return this.http.post<String[]>(`${this.serverUrl}/file/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  download(filename: string): Observable<HttpEvent<Blob>> {

    return this.http.get(`${this.serverUrl}/file/download/${filename}`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }

  listAllUploads(): Observable<string[]> {
    return this.http.get<string[]>(`${this.serverUrl}/file/list`);
  }
}
