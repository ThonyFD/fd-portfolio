import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActionSheetController, IonicModule, LoadingController} from "@ionic/angular";
import {ProfileCardComponent} from "../../components/profile-card/profile-card.component";
import {environment} from "../../../environments/environment";
import {FirebaseService} from "../../services/firebase.service";
import {Section} from "../../models/section";
import {MessageService} from "../../services/message.service";
import {GlobalService} from "../../services/global.service";
import {combineLatest} from "rxjs";
import {SortByPipe} from "../../pipes/sort-by.pipe";
import { SlotCardComponent } from "../../components/slot-card/slot-card.component";

@Component({
    selector: 'app-tab1',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ProfileCardComponent, SortByPipe, SlotCardComponent]
})
export class HomePage {

  public config: any
  public profileImage: string = ''
  public version: string = environment.version
  public sections: Array<Section> = []

  constructor(
    private fireService: FirebaseService,
    private messageService: MessageService,
    private actionSheetCtrl: ActionSheetController,
    private globalService: GlobalService,
    private loadingController: LoadingController,
  ) {
  }

  ionViewWillEnter() {
    this.init()
  }

  private async init(): Promise<void> {
    const loading = await this.loadingController.create()

    try {
      await loading.present()
      await this.fireService.loadConfig()
      await this.fireService.loadSections()
      this.profileImage = await this.fireService.getProfileImages()

      combineLatest({
        config: this.globalService.config$,
        sections: this.globalService.sections$
      }).subscribe(res => {
        this.config = res.config
        this.sections = res.sections

        loading.dismiss()
      })

    } catch (err) {
      console.error(err)
      this.messageService.showErrorToast()
    }
  }

  async presentLanguages() {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'custom-action-sheet',
      header: this.config.locale.localeSelectTitle,
      buttons: this.config.languages.map((option: any) => {
        return {
          text: option.label,
          icon: option.icon,
          handler: () => {
            this.changeLocale(option.code)
          }
        }
      })
    });

    await actionSheet.present();
  }

  private async changeLocale(locale: string): Promise<void> {
    const loading = await this.loadingController.create()

    try {
      await loading.present()
      await this.fireService.changeLocale(locale)
    } catch (err) {
      console.error(err)
      this.messageService.showErrorToast()
    } finally {
      loading.dismiss()
    }
  }

}
