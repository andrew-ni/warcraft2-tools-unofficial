import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IOService } from 'services/io.service';
import { SerializeService } from 'services/serialize.service';


interface LoginResponse {
  user_id: number;
  return_value: number;
  status: number;
  status_message: string;
}

interface GetMapResponse {

}

export interface MapDisplay {
  map_name: string;
  is_private: boolean;
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
  private maps = [
    { map_name: 'map1', is_private: true },
    { map_name: 'map1', is_private: true },
    { map_name: 'map1', is_private: true },
    { map_name: 'map1', is_private: true },
    { map_name: 'map1', is_private: true },
    { map_name: 'map2', is_private: false },
    { map_name: 'map3', is_private: true },
    { map_name: 'map4', is_private: false },
  ];

  constructor(
    private http: HttpClient,
    private serializeService: SerializeService,
    private ioService: IOService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'username': new FormControl(undefined, Validators.required),
      'password': new FormControl(undefined, Validators.required),
    });
  }

  private login() {
    if (this.form.valid || true) {
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
            console.log(resp);

            if (resp.return_value === 0 && resp.status === 200) {
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
  private async importMap() {
    const params = new HttpParams()
      .append('name', 'blhough')
      .append('password', '123');
    // .append('name', this.form.value.username)
    // .append('password', this.form.value.password);

    this.http.get('http://34.214.129.0/login/multi/index.php', { params })
      .do(resp => console.log(resp))
      .subscribe({
        next: resp => {
          const file = new File([resp as Buffer], Math.random().toString() + '.zip', { type: 'application/zip', });
          this.ioService.readPackage(resp as Buffer, true);
          console.log(resp);
        },
        error: err => {
          this.loggedIn = false;
          this.userId = undefined;
          console.error(err);
        }
      });
  }

  private async exportMap(zip = true) {
    let file: File;
    if (zip) {
      file = new File([await this.ioService.buildPackage()], Math.random().toString() + '.zip', { type: 'application/zip', });
    }
    console.log(file);

    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('uploader', this.userId.toString());
    formData.append('private', 'true');

    this.http.post('http://34.214.129.0/dlc/tool_upload.php', formData)
      .subscribe({
        next: resp => console.log(resp),
        error: err => console.error(err),
      });
  }
}
