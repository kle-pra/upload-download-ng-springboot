import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import { FileService } from './services/file.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	filenames: string[] = [];
	fileStatus = { status: '', percent: 0, requestType: '' };

	constructor(private readonly fileService: FileService) { }

	onUploadFiles(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.fileService.upload(target.files as FileList)
			.subscribe({
				next: event => {
					this.handleHttpEventProgress(event);
				},
				error: err => {
					console.log(err);
				}
			});
	}

	onDownloadFile(filename: string): void {
		this.fileService.download(filename)
			.subscribe({
				next: event => {
					console.log(event);
					this.handleHttpEventProgress(event);
				},
				error: err => {
					console.log(err);
				}
			});
	}

	private handleHttpEventProgress(event: HttpEvent<String[] | Blob>): void {
		switch (event.type) {
			case HttpEventType.UploadProgress:
				console.log('HttpEventType.UploadProgress', event);
				this.updateStatus(event.loaded, event.total!, 'Uploading');
				break;
			case HttpEventType.DownloadProgress:
				console.log('HttpEventType.DownloadProgress', event);
				this.updateStatus(event.loaded, event.total!, 'Downloading');
				break;
			case HttpEventType.ResponseHeader:
				console.log('HttpEventType.ResponseHeader', event);
				break;
			case HttpEventType.Response:
				console.log('HttpEventType.Response', event);
				// in case of download body is blob, else array
				if (event.body instanceof Array) {
					const files = <string[]>event.body;
					for (const filename of files) {
						this.filenames.unshift(filename);
					}
				} else {
					// saveAs(
					// 	new File([event.body!], event.headers.get('File-Name')!, { type: `${event.headers.get('Content-type')}; charset=utf-8` })
					// 	);
					saveAs(
						new Blob([event.body!], { type: `${event.headers.get('Content-type')}; charset=utf-8` }),
						event.headers.get('File-Name')!
					);
				}
				this.fileStatus.status = '';
				break;
			default:
				console.log(event);
				break;
		}
	}

	private updateStatus(loaded: number, total: number, requestType: string) {
		this.fileStatus.status = 'progress';
		this.fileStatus.requestType = requestType;
		this.fileStatus.percent = Math.round(100 * loaded / total)
	}

}
