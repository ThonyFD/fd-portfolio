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
      console.log(docData.id)
      console.log(JSON.stringify(rawData))

      if (rawData.visible && rawData.locale === lang) {
        slots.push(docData.data() as Section)
      }

      const docs = [
        {
          "id":"frontend",
          "slots": [
            {
              "order": 5,
              "logo": "js.webp",
              "title": "JavaScript",
              "subTitle": "Expert"
            },
            {
              "title": "Angular",
              "order": 4,
              "logo": "angular.webp",
              "subTitle": "Expert"
            },
            {
              "order": 3,
              "logo": "vue.svg",
              "subTitle": "Advance",
              "title": "Vue",
              "fit": "contain"
            },
            {
              "title": "Ionic",
              "logo": "ionic.svg",
              "subTitle": "Expert",
              "order": 2
            },
            {
              "order": 1,
              "subTitle": "Expert",
              "logo": "capacitor.webp",
              "title": "Capacitor"
            },
            {
              "order": 0,
              "subTitle": "Advance",
              "logo": "react.svg",
              "title": "React"
            },
          ],
          "label": "Frontend",
          "locale": "en",
          "hasHeading": true,
          "icon": "logo-html5",
          "order": 2,
          "sizeLg": "3",
          "orientation": "vertical",
          "visible": true
        },
        {
          "id":"backend",
          "slots": [
            {
              "subTitle": "Advance",
              "order": 4,
              "logo": "java.jpeg",
              "title": "Java"
            },
            {
              "subTitle": "Advance",
              "order": 1,
              "logo": "spring.svg",
              "title": "Spring Boot"
            },
            {
              "subTitle": "Expert",
              "order": 3,
              "title": "NodeJS",
              "logo": "nodejs.png"
            }
          ],
          "label": "Backend",
          "locale": "en",
          "hasHeading": true,
          "icon": "hardware-chip-outline",
          "order": 2,
          "sizeLg": "3",
          "orientation": "vertical",
          "visible": true
        },
        {
          "slots": [
            {
              "logo": "mysql.svg",
              "subTitle": "Advance",
              "title": "MySQL",
              "order": 3
            },
            {
              "logo": "oracle.svg",
              "subTitle": "Advance",
              "title": "ORACLE",
              "order": 3
            },
            {
              "logo": "mongodb.svg",
              "title": "MongoDB",
              "order": 3,
              "subTitle": "Advance"
            }
          ],
          "id": "databases",
          "label": "Databases",
          "locale": "en",
          "hasHeading": true,
          "icon": "server-outline",
          "order": 2,
          "sizeLg": "3",
          "orientation": "vertical",
          "visible": true
        },
        {
          "slots": [
            {
              "fit": "contain",
              "title": "Firebase",
              "logo": "firebase.png",
              "order": 0,
              "subTitle": "Expert"
            },
            {
              "fit": "contain",
              "title": "AWS",
              "logo": "aws.png",
              "order": 0,
              "subTitle": "Advance"
            },
            {
              "fit": "contain",
              "title": "Google Cloud",
              "logo": "google-cloud.svg",
              "order": 0,
              "subTitle": "Advance"
            },      
            {
              "fit": "contain",
              "title": "Azure",
              "logo": "azure.png",
              "order": 0,
              "subTitle": "Advance"
            }
          ],
          "id": "cloud",
          "label": "Cloud",
          "locale": "en",
          "hasHeading": true,
          "icon": "cloud-outline",
          "order": 2,
          "sizeLg": "3",
          "orientation": "vertical",
          "visible": true
        },
        {
          "slots": [
            {
              "fit": "contain",
              "title": "Jenkins",
              "logo": "jenkins.png",
              "order": 0,
              "subTitle": "Advance"
            },
            {
              "fit": "contain",
              "title": "Circle CI",
              "logo": "circleci.png",
              "order": 1,
              "subTitle": "Advance"
            },
            {
              "fit": "contain",
              "title": "Argo CD / Argo Workflows",
              "logo": "argo.png",
              "order": 2,
              "subTitle": "Advance"
            },      
            {
              "fit": "contain",
              "title": "Azure DevOps",
              "logo": "azure-devops.svg",
              "order": 3,
              "subTitle": "Advance"
            }
          ],
          "id": "ci-cd",
          "label": "CI/CD",
          "locale": "en",
          "hasHeading": true,
          "icon": "rocket-outline",
          "order": 2,
          "sizeLg": "3",
          "orientation": "vertical",
          "visible": true
        }
      ]

      docs.forEach(document => {
        setDoc(doc(this.db,'portfolio/tech-'+document.id), document)
      })
    })

    this.globalService.setSections(this.utilsService.toSorted(slots))
  }

  public async getProfileImages(): Promise<string> {
    return await getDownloadURL(ref(this.storage, 'profile.png'));
  }
}
