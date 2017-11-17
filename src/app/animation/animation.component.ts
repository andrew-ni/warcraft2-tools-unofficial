import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit {

  constructor() { }

  fun_close() {
    document.getElementById('animationModal').setAttribute('style', 'display: none;');
  }

  ngOnInit() {
  }

}


