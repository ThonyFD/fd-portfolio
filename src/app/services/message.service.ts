import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class MessageService {

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
  }

  public async showAlert(title: string, subHeader: string, message: string): Promise<void> {

    const alert = await this.alertController.create({
      header: title || 'Atención',
      subHeader: subHeader,
      animated: true,
      backdropDismiss: false,
      message: message,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
        },
      ],
    });
    await alert.present();

  }

  public async showErrorAlert(message?: string): Promise<void> {

    const alert = await this.alertController.create({
      header: 'Atención',
      animated: true,
      backdropDismiss: false,
      message: message || 'Mi perfil no carga, que pena, regresa en un rato',
      buttons: [{
        text: 'Entendido',
        role: 'cancel',
      }],
    });
    await alert.present();

  }

  public async showToast(message: string, position?: 'top' | 'bottom' | 'middle'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      animated: true,
      cssClass: 'bottom-toast',
      translucent: false,
      color: 'success',
      position: position || 'bottom',
      buttons: [
        {
          side: 'end',
          icon: 'close-circle-outline',
        }],
    });
    await toast.present();
  }

  public async showErrorToast(message?: string, position?: 'top' | 'bottom' | 'middle'): Promise<void> {
    const toast = await this.toastController.create({
      message: message || 'Mi perfil no carga, que pena... Regresa en un rato',
      animated: true,
      duration: 5000,
      translucent: false,
      color: 'danger',
      position: position || 'top',
      buttons: [
        {
          side: 'end',
          icon: 'close-circle-outline',
        }],
    });
    return toast.present();
  }

  public async showPermanentToast(message: string, position?: 'top' | 'bottom' | 'middle'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      animated: true,
      translucent: false,
      position: position || 'bottom',
      buttons: [
        {
          side: 'end',
          icon: 'close-circle-outline',
        }],
    });
    return toast.present();
  }
}
