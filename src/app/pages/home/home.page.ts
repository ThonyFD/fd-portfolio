import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {ProfileCardComponent} from "../../components/profile-card/profile-card.component";

@Component({
  selector: 'app-tab1',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ProfileCardComponent]
})
export class HomePage {

  public head = {
    img: 'assets/avatar.jpeg',
    title: 'Anthony Mosquera',
    subTitle: "Engineer Manager • Developer Manager • Team Builder <br/>Frontend Engineer • Backend Engineer • Ionic Expert",
   // description: "Tengo mucha experiencia trabajando con equipos ágiles de alto rendimiento, en los cuales puedo servir como líder, y aportar toda la experiencia que he ganado a través de mi carrera profesional."
  }
  public apps: Array<any> = [{
    img: 'assets/tigo.webp',
    title: 'Digital Developer Manager',
    subTitle: 'Tigo Panamá • Millicom(Filial)',
  },{
    img: 'assets/wicon.jpeg',
    title: 'Arquitecto Empresarial',
    subTitle: 'Wicon Panamá • Freelance',
  },{
    img: 'assets/bg.webp',
    title: 'Senior Developer',
    subTitle: 'Banca Móvil • Banco General',
  },{
    img: 'assets/yappy.webp',
    title: 'Senior Developer',
    subTitle: 'Yappy • Banco General',
  },{
    img: 'assets/banistmo.webp',
    title: 'Ingeniero de AWS',
    subTitle: 'Banistmo • Bancolombia(Filial)',
  },{
    img: 'assets/movistar.webp',
    title: 'Junior Developer',
    subTitle: 'Movistar Panamá • Telefónica(Filial)',
  }]
  constructor() {

  }

}
