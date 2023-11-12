import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private _config = new BehaviorSubject<any>({})
  public config$ = this._config.asObservable()

  private _sections = new BehaviorSubject<any>({})
  public sections$ = this._sections.asObservable()

  constructor() {
    this._sections.next([])
    this._config.next({})
  }


  public setConfig(config: any): void {
    this._config.next(config)
  }
  public setSections(sections: any): void {
    this._sections.next(sections)
  }
}
