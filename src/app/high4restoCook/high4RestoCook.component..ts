import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {  merge, Observable, of, Subject} from 'rxjs';
import { map,  take, tap } from 'rxjs/operators';
import { defaultLanguage, languages } from '../shared/model/languages';
import { SpeechError } from '../shared/model/speech-error';
import { SpeechEvent } from '../shared/model/speech-event';
import { SpeechRecognizerService } from '../shared/services/web-apis/speech-recognizer.service';
import { SpeechNotification } from '../shared/model/speech-notification';


import { environment } from '../shared/environement/environement';
import { Util } from '../shared/environement/util';
import { OrderI } from '../shared/model/interfaces/tracability/Order';
import { ToPrepareI } from '../shared/model/interfaces/tracability/ToPrepare';
import { PrepareI } from '../shared/model/interfaces/tracability/Prepare'
import { MessageService } from '../shared/messages/message.service';
import { PreparateurService } from '../shared/services/preparateurService';
import { Socket } from '../shared/services/Socket';
import { Message } from '../shared/model/interfaces/Message';
import { AuthentificationService } from '../shared/services/Auth/authentification.service';
import { ExpireService } from '../shared/services/expire.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';
import { VCommandeI } from '../shared/model/interfaces/VCommande';
import { VocalText } from '../shared/model/VocalText';

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

@Component({
  selector: 'high4RestoCook',
  templateUrl: './high4RestoCook.component.html',
  styleUrls: ['./high4RestoCook.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class High4RestoCookComponent implements OnInit {
  vocalText:VocalText=new VocalText();
  ROLE=environment.role;
  languages: string[] = languages;
  currentLanguage: string = defaultLanguage;
  totalTranscript?: string;
  title=environment.tilte;

  transcript$?: Observable<string>;
  listening$?: Observable<boolean>;
  errorMessage$?: Observable<string>;
  defaultError$ = new Subject<string | undefined>();

  private audioFlux = new Subject<string>();
  signals: Signal[] = [];
  toTakes: ToTake[] = [];
  toTakeProducts: ToTakeProduct[] = [];
  toPrepares: ToPrepare[] = [];
  toPrepareProducts: ToPrepareProduct[] = [];
  util = new Util();
  commandes: VCommandeI[] = [];
  command: string = "";

  callServer(msg?: string): void {
    const message: Message = { type: "call", function: "Vous êtes appelé en cuisine" };
    this.preparateurService.callServer(message).pipe(take(1)).subscribe();
  }


  prepare(order: OrderI): void {
    var toPrepare: ToPrepareI = { order: order, inside: "", executor: this.authenticationService.userName, messageToNext: "" };
    this.preparateurService.moveToPrepare(toPrepare).pipe(take(1)).subscribe(toPrep => {
      this.initToPrepare();
      this.initToTake();
    });
  }

  prepareAllTable(toTake: ToTake): void {
    for (let order of toTake.items) {
      this.prepare(order);
    }
  }

  prepareAllTableWithTableName(name: string): void {
    this.toTakes.filter(a => a.tableName == name)[0].items.forEach(order => { this.prepare(order) });
  }

  prepareAllProduct(productName: string): void {
    this.preparateurService.getToTakeOrder(this.ROLE).pipe(take(1)).subscribe(result => {
      var tpOrders: OrderI[] = result.filter(result => result.preOrder.stock.item.name+" "+result.annonce == productName);
      for (let order of tpOrders) {
        this.prepare(order);
      }
      this.initToPrepare();
      this.initToTake();
    })
  }

  prepareAllProductWithLongName(productName: string): void {
    this.preparateurService.getToTakeOrder(this.ROLE).pipe(take(1)).subscribe(result => {
      var tpOrders: OrderI[] = result.filter(result => result.preOrder.stock.item.name + " " + result.annonce == productName);
      for (let order of tpOrders) {
        this.prepare(order);
      }
      this.initToPrepare();
      this.initToTake();
    })
  }

  finish(toPrepare: ToPrepareI): void {
    var prepare: PrepareI = { toPrepare: toPrepare, inside: "" };
    this.preparateurService.moveToPrepared(prepare).pipe(take(1)).subscribe(t => {
      this.initToPrepare();
    })
  }

  finishAllTable(toPrepare: ToPrepare): void {
    for (let item of toPrepare.items) {
      this.finish(item);

    }
  }

  finishAllProduct(product: string): void {
    this.preparateurService.getToPrepare(this.ROLE).pipe(take(1)).subscribe(toPrepare => {
      toPrepare.filter(a => a.order.preOrder.stock.item.name + " " + a.order.annonce == product).forEach(toPrepare => {
        this.finish(toPrepare);
        this.initToPrepare();
      })
    })
  }

  private initSignal(): void {
    this.preparateurService.getSignalOrder(this.ROLE).pipe(take(1)).subscribe(result => {
      this.signals = [];
      var tpRecord: Record<string, OrderI[]> = groupBy(result, i => i.preOrder.destination);
      for (let key in tpRecord) {
        var tpTable = new Signal();
        tpTable.tableName = key;

        var reduce = tpRecord[key].reduce((a, b) => {
          var name: string = b.preOrder.stock.item.name + " " + b.annonce;
          if (!a.hasOwnProperty(name)) {
            a[name] = 0;
          }
          a[name]++;
          return a;
        }, {});

        var reducesExtended = Object.keys(reduce).map(k => {
          return { name: k, count: reduce[k] } as NameCountI;
        });

        for (let nc in reducesExtended) {
          tpTable.items.push(reducesExtended[nc]);
        }

        this.signals.push(tpTable);
      }
      this.change.detectChanges();
    });
  }

  private initToTake(): void {
    this.preparateurService.getToTakeOrder(this.ROLE).pipe(take(1)).subscribe(result => {
      this.toTakes = [];
      this.toTakeProducts = [];
      var tpRecord: Record<string, OrderI[]> = groupBy(result, i => i.preOrder.stock.item.name);
      for (let key in tpRecord) {
        var tpTakeProduct = new ToTakeProduct();
        tpTakeProduct.productName = key;

        var reduce = tpRecord[key].reduce((a, b) => {
          var name = b.preOrder.stock.item.name + " " + b.annonce;
          if (!a.hasOwnProperty(name)) {
            a[name] = 0;
          }
          a[name]++;
          return a;
        }, {});

        var reducesExtended = Object.keys(reduce).map(k => {
          return { name: k, count: reduce[k] } as NameCountI;
        });

        for (let nc in reducesExtended) {
          this.toTakeProducts.push({ productName: reducesExtended[nc].name, count: reducesExtended[nc].count });
        }
      }


      var tpRecord: Record<string, OrderI[]> = groupBy(result, i => i.preOrder.destination)
      for (let key in tpRecord) {
        var tpToTake = new ToTake();
        tpToTake.tableName = key;
        tpToTake.items = tpRecord[key];
        this.toTakes.push(tpToTake);
      }
      this.change.detectChanges();
    });
  }

  private initToPrepare(): void {
    this.preparateurService.getToPrepare(this.ROLE).pipe(take(1)).subscribe(result => {
      this.toPrepares = [];
      this.toPrepareProducts = [];
      var tpRecord: Record<string, ToPrepareI[]> = groupBy(result, i => i.order.preOrder.stock.item.name);
      for (let key in tpRecord) {
        var tpTakeProduct = new ToTakeProduct();
        tpTakeProduct.productName = key;

        var reduce = tpRecord[key].reduce((a, b) => {
          var name = b.order.preOrder.stock.item.name + " " + b.order.annonce;
          if (!a.hasOwnProperty(name)) {
            a[name] = 0;
          }
          a[name]++;
          return a;
        }, {});

        var reducesExtended = Object.keys(reduce).map(k => {
          return { name: k, count: reduce[k] } as NameCountI;
        });

        for (let nc in reducesExtended) {
          this.toPrepareProducts.push({ productName: reducesExtended[nc].name, count: reducesExtended[nc].count });
        }
      }

      var tpRecord: Record<string, ToPrepareI[]> = groupBy(result, i => i.order.preOrder.destination)
      for (let key in tpRecord) {
        var tpToPrepare = new ToPrepare();
        tpToPrepare.tableName = key;
        tpToPrepare.items = tpRecord[key];
        this.toPrepares.push(tpToPrepare);
      }
      this.change.detectChanges();
    });
  }

  private initAllData(): void {
    this.initSignal();
    this.initToTake();
    this.initToPrepare();
  }

  private initAllCommand(): void {
    this.commandes = [];
    this.commandes.push({ commande: "Comfirmer", action: "" } as VCommandeI);
    this.commandes.push({ commande: "Annuler", action: "" } as VCommandeI);
    this.commandes.push({ commande: "Merci", action: "" } as VCommandeI);

    for(let text of this.vocalText.callServerAll)
    {
      this.commandes.push({ commande: text, action: "callServer:all" } as VCommandeI);
    }
    for(let text of this.vocalText.resumeSignaled)
    {
      this.commandes.push({ commande: text, action: "resume:signaled" } as VCommandeI);
    }
    for(let text of this.vocalText.resumeToTakebyTable)
    {
      this.commandes.push({ commande: text, action: "resume:toTakebyTable"} as VCommandeI);

    }
    for(let text of this.vocalText.resumeToTakeByProduct)
    {
      this.commandes.push({ commande: text, action: "resume:toTakeByProduct" } as VCommandeI);
    }

    for (let products of this.toTakeProducts) {
      for(let text of this.vocalText.prepareItem)
      {
        text=text.replace("$product",products.productName);
        this.commandes.push({ commande: text, action: "prepareItem:" + products.productName } as VCommandeI);
      }
    }
    for (let tables of this.toTakes) {
      for(let text of this.vocalText.prepareTable)
      {
        text=text.replace("$table",tables.tableName);
        this.commandes.push({ commande: text, action: "prepareTable:" + tables.tableName } as VCommandeI);
      }

      var predessessor: string = "";
      for (let item of tables.items) {
        var current = item.preOrder.stock.item.name+" "+item.annonce;
        if (predessessor != current) {
          predessessor = current;
          for(let text of this.vocalText.prepare)
          {
            text=text.replace("$product",current).replace("$table",tables.tableName);
            this.commandes.push({ commande: text, action: "prepare:" + current + ";" + tables.tableName } as VCommandeI);
          }
          for(let text of this.vocalText.prepareOnly)
          {
            text=text.replace("$product",current).replace("$table",tables.tableName);
            this.commandes.push({ commande: text, action: "prepareOnly:" + current + ";" + tables.tableName } as VCommandeI);
          }
        }
      }
    }
    for (let products of this.toPrepareProducts) {
      for(let text of this.vocalText.finishAllProduct)
      {
        text=text.replace("$product",products.productName);
        this.commandes.push({ commande: text, action: "finishAllProduct:" + products.productName } as VCommandeI);
      }

    }
    for (let table of this.toPrepares) {
      for(let text of this.vocalText.finishAllTable)
      {
        text=text.replace("$table",table.tableName)
        this.commandes.push({ commande: text, action: "finishAllTable:" + table.tableName } as VCommandeI);
      }
      var predessessor: string = "";
      for (let item of table.items) {
        var current = item.order.preOrder.stock.item.name+" "+item.order.annonce;
        if (predessessor != current) {
          predessessor = current;
          for(let text of this.vocalText.finishAll)
          {
            text=text.replace("$product",current).replace("$table",table.tableName)
            this.commandes.push({ commande: text, action: "finishAll:" + current + ";" + table.tableName } as VCommandeI);
          }
          for(let text of this.vocalText.finishOne)
          {
            text=text.replace("$product",current).replace("$table",table.tableName);
            this.commandes.push({ commande: text, action: "finishOne:" + current + ";" + table.tableName } as VCommandeI);
          }
        }
      }
    }
  }



  constructor(
    private talk: SpeechSynthesizerService,
    private messageService: MessageService, private preparateurService: PreparateurService,
    private speechRecognizer: SpeechRecognizerService, private authenticationService: AuthentificationService, private change: ChangeDetectorRef,
    private expire: ExpireService
  ) {

  }


  ngOnInit(): void {
    this.talk.initSynthesis();
    this.expire.check();
    const High4RestoCookReady = this.speechRecognizer.initialize(this.currentLanguage);
    if (High4RestoCookReady) {
      this.initRecognition();
    } else {
      this.errorMessage$ = of('Votre navigateur ne supporte pas cette application');
    }
    var socket: Socket = new Socket(environment.socketColdCook)
    var listener: EventEmitter<any> = new EventEmitter();
    this.initAllData();
    listener = socket.getEventListener();
    this.audioFlux.subscribe({
      next: (audio) => new Audio(environment.apiUrl + "/serveur/download/" + audio).play()
    });
    listener.subscribe((event: { type: string; data: string; }) => {
      if (event.type == "message") {
        var txt: string = event.data;
        var command: string = txt.split(":")[0];
        var value: string = txt.split(":")[1];
        if (command == "audio")
          this.audioFlux.next(value);
        if (command == "update") {
          this.change.detectChanges();
          this.initSignal();
          this.initToTake();

        }
      }
      if (event.type == "open") {
        console.log("Connexion open");
      }
      if (event.type == "close") {
        console.log("Connexion close");
      }
    });
    setInterval(()=> {this.verifyMic() },1000);
  }

  verifyMic():void{
    if(!this.speechRecognizer.isListening)
    {
      this.defaultError$.next(undefined);
      this.speechRecognizer.start();
    }
  }

  start(): void {

    if (this.speechRecognizer.isListening) {
      this.stop();
      return;
    }

    this.defaultError$.next(undefined);
    this.speechRecognizer.start();
  }

  stop(): void {
    this.speechRecognizer.stop();

  }

  private initRecognition(): void {
    this.transcript$ = this.speechRecognizer.onResult().pipe(
      tap((notification) => {
        this.processNotification(notification);
      }),
      map((notification) => notification.content || '')
    );

    this.listening$ = merge(
      this.speechRecognizer.onStart(),
      this.speechRecognizer.onEnd()
    ).pipe(map((notification) => notification.event === SpeechEvent.Start));

    this.errorMessage$ = merge(
      this.speechRecognizer.onError(),
      this.defaultError$
    ).pipe(
      map((data) => {
        if (data === undefined) {
          return '';
        }
        if (typeof data === 'string') {
          return data;
        }
        let message;
        switch (data.error) {
          case SpeechError.NotAllowed:
            message = `Vous n'avez pas donné accès au micro`;
            break;
          case SpeechError.NoSpeech:
            message = `Rien n'a été détecté veuillez recommencé`;
            break;
          case SpeechError.AudioCapture:
            message = `Vous n'avez pas de micro`;
            break;
          default:
            message = '';
            break;
        }
        return message;
      })
    );
  }
  private resume(action: string): void {
    if (action == "toTakeByProduct") {
      resume = "";
      this.toTakeProducts.forEach(toProduct => {
        resume += toProduct.count + ".." + toProduct.productName + "..."
      })
      this.talk.speak(resume);
    }
    if (action == "toTakebyTable") {

      this.preparateurService.getToTakeOrder(this.ROLE).pipe(take(1)).subscribe(result => {
        var prepares: Signal[] = [];
        var tpRecord: Record<string, OrderI[]> = groupBy(result, i => i.preOrder.destination);
        for (let key in tpRecord) {
          var tpTable = new Signal();
          tpTable.tableName = key;

          var reduce = tpRecord[key].reduce((a, b) => {
            var name: string = b.preOrder.stock.item.name + " " + b.annonce;
            if (!a.hasOwnProperty(name)) {
              a[name] = 0;
            }
            a[name]++;
            return a;
          }, {});

          var reducesExtended = Object.keys(reduce).map(k => {
            return { name: k, count: reduce[k] } as NameCountI;
          });

          for (let nc in reducesExtended) {
            tpTable.items.push(reducesExtended[nc]);
          }

          prepares.push(tpTable);
        }
        var resume: string = "";
        prepares.forEach(prepare => {
          resume += "Table " + prepare.tableName + ".";
          prepare.items.forEach(item => {
            resume += item.count + " " + item.name + ".";
          })
          resume += ".";
        });
        this.talk.speak(resume);
      });
    }

    if (action == "signaled") {
      var resume: string = "";
      this.signals.forEach(signal => {
        resume += "Table " + signal.tableName + '!';
        signal.items.forEach(item => {
          resume += item.count + " " + item.name + ".";
        })
          + ".";
      })
      this.talk.speak(resume);
    }
  }

  private executeCommand(command: string): void {
    var commande: string = command.split(':')[0];
    var action: string = command.split(':')[1];

    if (commande == "callServer") {
      this.talk.speak("J'apelle le serveur pour qu'il ou elle vienne en cuisine");
      this.callServer();
    }

    else if (commande == "resume") {
      this.resume(action);
    }

    else if (commande == "prepareItem") {
      this.prepareAllProductWithLongName(action);
      this.talk.speak("Tous les " + action + " sont mis dans la préparation");
    }
    else if (commande == "prepareTable") {
      this.prepareAllTableWithTableName(action);
      this.talk.speak("Tous les éléments de la table " + action + " ont été mis dans la préparation");
    }
    else if (commande == "prepare") {
      var product: string = action.split(';')[0];
      var table: string = action.split(';')[1];
      this.toTakes.filter(a => a.tableName == table).forEach(toTake => {
        toTake.items.filter(a => {
          if (a.preOrder.stock.item.name+" "+a.annonce == product)
            return true;
        }).forEach(finalItem => {
          this.prepare(finalItem);
        })
      })
      this.talk.speak("La demande a été exécutée");
    }
    else if (commande == "prepareOnly") {
      var product: string = action.split(';')[0];
      var table: string = action.split(';')[1];
      this.toTakes.filter(a => a.tableName == table).forEach(toTake => {
        this.prepare(toTake.items.filter(a => {
          if (a.preOrder.stock.item.name+" "+a.annonce == product)
            return true;
        })[0]);
      })
      this.talk.speak("La demande a été exécutée");
    }
    else if (commande == "finishAllProduct")
    {
      this.finishAllProduct(action);
      this.talk.speak("La demande a été exécutée");
    }
    else if (commande=="finishAllTable")
    {
      this.toPrepares.filter(a=>a.tableName==action)[0].items.forEach(item=>this.finish(item));
      this.talk.speak("La demande a été exécutée");
    }
    else if (commande=="finishAll")
    {
      var product:string=action.split(';')[0];
      var table:string=action.split(';')[1];
      this.toPrepares.filter(a=>a.tableName==table)[0].items.filter(a=>a.order.preOrder.stock.item.name+" "+a.order.annonce==product).forEach(item=>this.finish(item));
    }
    else if (commande=="finishOne")
    {
      console.log("i am here");;
      var product:string=action.split(';')[0];
      var table:string=action.split(';')[1];
      this.finish(this.toPrepares.filter(a=>a.tableName==table)[0].items.filter(a=>a.order.preOrder.stock.item.name+" "+a.order.annonce==product)[0]);
    }

  }


  private processNotification(notification: SpeechNotification<string>): void {
    if (notification.event === SpeechEvent.FinalContent) {
      this.initAllCommand();
      var finalNotif: string = "";
      var commande: string = "";
      var minscore: number = 100;
      this.commandes.forEach(result => {
        var score: number = this.util.levenshtein(result.commande, notification.content);
        if (score < minscore) {
          minscore = score;
          finalNotif = result.commande;
          commande = result.action;
        }
      });
      if (minscore > (notification.content.length / 3)) {
        this.talk.speak("Je n'ai pas compris ce que vous me demandez");
      }
      else {
        if (finalNotif == "Comfirmer") {
          this.executeCommand(this.command);
        }
        else if (finalNotif == "Annuler") {
          this.command = "";
        }
        else if (finalNotif == "Merci") {
          this.talk.speak("De rien");
        }
        else {
          this.talk.speak("Est ce que vous avez demandé " + finalNotif + ". Si vous voulez vous pouvez confirmer ou annuler");
          this.command = commande;
        }
      }

    }
  }
}



export interface NameCountI {
  name: string
  count: number
}

export interface SignalI {
  tableName: string
  items: NameCountI[];
}

export class Signal implements SignalI {
  tableName: string = "";
  items: NameCountI[] = [];
}

export class ToTake {
  tableName: string = "";
  items: OrderI[] = [];
}

export class ToTakeProduct {
  productName: string = "";
  count: number = 0;
}

export class ToPrepare {
  tableName: string = "";
  items: ToPrepareI[] = [];
}

export class ToPrepareProduct {
  productName: string = "";
  count: number = 0;
}