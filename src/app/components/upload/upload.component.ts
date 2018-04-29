import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import {FlashMessagesService} from 'angular2-flash-messages';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  filesToUpload: Array<File> = [];
    constructor(private uploadService: UploadService,
    private flashMessage:FlashMessagesService
  
  ) { }

  ngOnInit() {
  }

  upload() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    console.log(files);

    for (let i = 0; i < files.length; i++) {
        formData.append('uploads[]', files[i], files[i]['name']);
    }
    console.log('form data variable :   ' + formData.toString());
    this.uploadService.uploadFiles(formData).subscribe(
      res => {
        console.log(res);

        if(this.filesToUpload.length > 0){
          this.flashMessage.show('Article was uploaded sucessfully', {
            cssClass: 'alert-success',
            timeout: 5000});
        }else{
          this.flashMessage.show('Select an article to upload', {
            cssClass: 'alert-danger',
            timeout: 5000});
        }

        const filesArray = {'files': this.getFileList()};
        this.uploadService.processDocuments(filesArray).subscribe(
          resp => {
            console.log(resp);
          }
        );
      }
    );
  }

  fileChangeEvent(fileInput: any) {
      this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  getFileList() {
    let files = [];
    for(let i = 0; i < this.filesToUpload.length; i++){
      files.push(this.filesToUpload[i].name);
    }
    return files;
  }

}
