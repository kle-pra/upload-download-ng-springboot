import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { FileService } from './services/file.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	allUploadedFilenames: string[] = [];

	// currently uploaded/downloaded file status
	currentFileStatus = { isLoading: false, percent: 0, requestType: '' };

	constructor(private readonly fileService: FileService) { }

	ngOnInit(): void {
		this.fileService.listAllUploads()
			.subscribe(uploadedFileNames => {
				this.allUploadedFilenames = uploadedFileNames;
			});
	}

	onUploadFiles(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.fileService.upload(target.files as FileList)
			.subscribe({
				next: event => this.handleHttpEventProgress(event),
				error: err => console.log(err)
			});
	}

	onDownloadFile(filename: string): void {
		this.fileService.download(filename)
			.subscribe({
				next: event => this.handleHttpEventProgress(event),
				error: err => console.log(err)
			});
	}

	private handleHttpEventProgress(httpEvent: HttpEvent<String[] | Blob>): void {
		switch (httpEvent.type) {
			case HttpEventType.UploadProgress:
				console.log('HttpEventType.UploadProgress', httpEvent);
				this.updateCurrentFileStatus(httpEvent.loaded, httpEvent.total!, 'Uploading');
				break;
			case HttpEventType.DownloadProgress:
				console.log('HttpEventType.DownloadProgress', httpEvent);
				this.updateCurrentFileStatus(httpEvent.loaded, httpEvent.total!, 'Downloading');
				break;
			case HttpEventType.ResponseHeader:
				console.log('HttpEventType.ResponseHeader', httpEvent);
				break;
			case HttpEventType.Response:
				console.log('HttpEventType.Response', httpEvent);
				// in case of download body is blob, else array
				if (httpEvent.body instanceof Array) {
					const files = <string[]>httpEvent.body;
					for (const filename of files) {
						this.allUploadedFilenames.unshift(filename);
					}
				} else {
					saveAs(
						new Blob([httpEvent.body!], { type: `${httpEvent.headers.get('Content-type')}; charset=utf-8` }),
						httpEvent.headers.get('File-Name')! // filename from costum header from backend
					);
					// same as: saveAs(new File([event.body!], event.headers.get('File-Name')!, { type: `${event.headers.get('Content-type')}; charset=utf-8` }));
				}
				this.currentFileStatus.isLoading = false;
				break;
			default:
				console.log(httpEvent);
				break;
		}
	}

	private updateCurrentFileStatus(loaded: number, total: number, requestType: string) {
		this.currentFileStatus.isLoading = true;
		this.currentFileStatus.requestType = requestType;
		this.currentFileStatus.percent = Math.round(100 * loaded / total)
	}

}
