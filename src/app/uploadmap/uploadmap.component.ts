import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-uploadmap',
  templateUrl: './uploadmap.component.html',
  styleUrls: ['./uploadmap.component.scss']
})
export class UploadmapComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  fun_close(event) {
    event.target.parentNode.parentNode.parentNode.removeChild(event.target.parentNode.parentNode);
  }
}
