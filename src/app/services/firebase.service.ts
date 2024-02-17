import {Injectable} from '@angular/core';
import {initializeApp} from "firebase/app";
import {getFirestore, Firestore, getDoc, getDocs, collection, doc, setDoc} from "firebase/firestore";
import {getDownloadURL, ref, getStorage, FirebaseStorage} from "firebase/storage";
import {environment} from "../../environments/environment";
import {Section} from "../models/section";
import {GlobalService} from "./global.service";
import {UtilsService} from "./utils.service";
import {lastValueFrom, take} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private db: Firestore;
  private storage: FirebaseStorage;

  constructor(
    private globalService: GlobalService,
    private utilsService: UtilsService
  ) {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
  }

  public async changeLocale(locale: string): Promise<void> {
    const code = locale.split('-')[0]
    const localShop = await getDoc(doc(this.db, 'portfolio-locales', code))
    const config: any = await lastValueFrom(this.globalService.config$.pipe(take(1)))

    this.globalService.setConfig({
      ...config,
      locale: localShop.data()
    })

    await this.loadSections(code)
  }

  public async loadConfig(): Promise<void> {
    const locale = this.utilsService.getUsersLocale('es-EN').split('-')[0]
    let localShop = await getDoc(doc(this.db, 'portfolio-locales', locale))

    if (!localShop.exists()) {
      localShop = await getDoc(doc(this.db, 'portfolio-locales', 'es'))
    }

    const snapShop = await getDoc(doc(this.db, environment.portfolio, 'config'))
    const config: any = snapShop.data()
    config.locale = localShop.data()

    this.globalService.setConfig(config)
  }

  public async loadSections(locale: string = ''): Promise<void> {
    let slots: Array<Section> = []
    const config: any = await lastValueFrom(this.globalService.config$.pipe(take(1)))
    const snapShop = await getDocs(collection(this.db, environment.portfolio))
    const lang = locale || config.locale.code

    snapShop.forEach(docData => {

      const rawData = docData.data() as Section
      console.log('rawData: ', docData.id)
      console.log('rawData: ', JSON.stringify(rawData))
      if (rawData.visible && rawData.locale === lang) {
        slots.push(docData.data() as Section)
      }
    })

    this.globalService.setSections(this.utilsService.toSorted(slots))
  }

  public async getProfileImages(): Promise<string> {
    return await getDownloadURL(ref(this.storage, 'profile.png'));
  }
}
