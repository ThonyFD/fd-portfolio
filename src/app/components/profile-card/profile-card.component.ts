import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule]
})
export class ProfileCardComponent  implements OnInit {

  @Input('profile') profile: any;
  constructor() { }

  ngOnInit() {}

}
