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

interface GetMapsResponse {
  maps: { [index: string]: boolean }; // Returns an object instead of an array but we can work with it.
  return_value: number;
  status: number;
  status_message: string;
}

export interface MapDisplay {
  name: string;
  isPrivate: boolean;
}

@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.scss']
})
export class WebComponent implements OnInit {
  private loggedIn = false;
  private userId: number;
  private user: string;
  private form: FormGroup;
  private maps: MapDisplay[] = [];
  private exportName = '';

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
    if (this.form.valid) {
      console.log(this.form.value.username);
      console.log(this.form.value.password);

      const params = new HttpParams()
        .append('name', this.form.value.username)
        .append('password', this.form.value.password);

      this.http.get<LoginResponse>('http://34.214.129.0/login/multi/index.php', { params })
        .do(resp => console.log(resp))
        .subscribe({
          next: resp => {
            console.log(resp);

            if (resp.return_value === 0 && resp.status === 200) {
              this.userId = resp.user_id;
              this.loggedIn = true;
              this.user = params.get('name');
              this.getMaps();
            } else {
              this.loggedIn = false;
              this.userId = undefined;
              this.user = '';
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


  private async getMaps() {
    if (!this.loggedIn) return;

    const params = new HttpParams()
      .append('name', this.user)
      .append('info_request', 'MAP');
    // .append('name', this.form.value.username)
    // .append('password', this.form.value.password);

    this.http.get<GetMapsResponse>('http://34.214.129.0/login/multi/index.php', { params })
      .do(resp => console.log(resp))
      .subscribe({
        next: resp => {
          this.maps = [];
          for (const name in resp.maps) {
            if (resp.maps.hasOwnProperty(name)) {
              this.maps.push({ name, isPrivate: resp.maps[name] });
            }
          }
        },
        error: err => {
          this.loggedIn = false;
          this.userId = undefined;
          console.error(err);
        }
      });

  }

  private async importMap(name: string) {
    const params = new HttpParams()
      .append('map', name);
    // .append('name', this.form.value.username)
    // .append('password', this.form.value.password);

    this.http.get('http://34.213.125.24/dlc/map_download.php', { params })
      .do(resp => console.log(resp))
      .subscribe({
        next: resp => {
          // const file = new File([resp as Buffer], Math.random().toString() + '.zip', { type: 'application/zip', });
          // this.ioService.readPackage(resp as Buffer, true);
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
    let url: string;
    if (zip) {
      url = 'http://34.214.129.0/downloadCMaps/zip_upload.php';
      file = new File([await this.ioService.buildPackage()], this.exportName + '.zip', { type: 'application/zip' });
    } else {
      url = 'http://34.214.129.0/dlc/tool_upload.php';
      file = new File([this.serializeService.serializeMap()], this.exportName + '.map', { type: 'text/plain' });
    }
    console.log(file);

    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('uploader', this.userId.toString());
    formData.append('private', 'false');

    this.http.post(url, formData)
      .subscribe({
        next: resp => {
          console.log(resp);
          this.getMaps();
        },
        error: err => console.error(err),
      });
  }
}
