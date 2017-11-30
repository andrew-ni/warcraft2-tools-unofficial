import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SerializeService } from 'services/serialize.service';


interface LoginResponse {
  user_id: number;
  return_value: number;
  status: number;
  status_message: string;
}

@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.scss']
})
export class WebComponent implements OnInit {
  private loggedIn = false;
  private userId: number;
  private form: FormGroup;

  constructor(
    private http: HttpClient,
    private serializeService: SerializeService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'username': new FormControl(undefined, Validators.required),
      'password': new FormControl(undefined, Validators.required),
    });
  }

  private login() {
    if (this.form.valid) {
      console.log(this.form.value.username);
      console.log(this.form.value.password);

      const params = new HttpParams()
        .append('name', 'blhough')
        .append('password', '123');
      // .append('name', this.form.value.username)
      // .append('password', this.form.value.password);

      this.http.get<LoginResponse>('http://34.214.129.0/login/multi/index.php', { params })
        .do(resp => console.log(resp))
        .subscribe({
          next: resp => {
            if (resp.return_value === 0) {
              this.userId = resp.user_id;
              this.loggedIn = true;
              this.exportMap();
            } else {
              this.loggedIn = false;
              this.userId = undefined;
            }
          },
          error: err => {
            this.loggedIn = false;
            this.userId = undefined;
            console.error(err);
          }
        });
    }
  }

  private exportMap() {
    const file = new File([this.serializeService.serializeMap()], 'testtool5.map', { type: 'text/plain', });

    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('uploader', this.userId.toString());

    this.http.post('http://34.214.129.0/dlc/tool_upload.php', formData, { responseType: 'text' })
      .subscribe({
        next: resp => console.log(resp),
        error: err => console.error(err),
      });
  }
}
