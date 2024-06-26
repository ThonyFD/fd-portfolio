import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {Section} from "../../models/section";

@Component({
  selector: 'app-slot-card',
  templateUrl: './slot-card.component.html',
  styleUrls: ['./slot-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule]
})
export class SlotCardComponent  implements OnInit {

  @Input('slot') slot: Section = {} as Section;
  @Input('orientation') orientation: string = 'horizontal';
  
  public loaded = 'loading'

  ngOnInit() {}
}
