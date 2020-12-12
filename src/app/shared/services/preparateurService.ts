import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import {environment} from '../environement/environement'
import {Message} from '../model/interfaces/Message'
import {ToPrepareI} from '../model/interfaces/tracability/ToPrepare'
import {PrepareI} from '../model/interfaces/tracability/Prepare'
import {OrderI} from '../model/interfaces/tracability/Order'
import { AudioI } from '../model/interfaces/AudioI';
import { Signal } from 'src/app/high4restoCook/high4RestoCook.component.';
import {cloneDeep} from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class PreparateurService {
    private findSignalOrderUrl = environment.apiUrl + '/preparateur/findSignalOrder/';
    private findToTakeOrderURL = environment.apiUrl + '/preparateur/findToTakeOrder/';
    private moveToPrepareUrl = environment.apiUrl + '/preparateur/moveToPrepare/';
    private moveToPreparedUrl = environment.apiUrl + '/preparateur/moveToPrepared/'
    private findToPrepareUrl = environment.apiUrl + '/preparateur/findToPrepare/';
    private callServerUrl=environment.apiUrl + '/preparateur/callServer/';
    private speakUrl=environment.apiUrl + '/preparateur/speak/';

    private diffSignal2(a:Signal,b:Signal):Signal
    {
      for(let bitem of b.items)
      {
        var idx=0;
        for(let aitem of a.items)
        {
          if(bitem.name==aitem.name)
          {
            a.items[idx].count-=bitem.count;
            if(a.items[idx].count==0)
              a.items.splice(idx,1);
          }
          idx+=1;
        }
      }
      return a;
    }

    diffSignal(aa:Signal[],bb:Signal[]):Signal[]
    {
      var a:Signal[]=cloneDeep(aa);
      var b:Signal[]=cloneDeep(bb);

      var finalSignal:Signal[]=[];
      for(let asignal of a)
      {
        var currentSignal:Signal=null;
        for(let bsignal of b)
        {
          if(asignal.tableName==bsignal.tableName)
          {
            currentSignal=this.diffSignal2(asignal,bsignal);
            break;
          }
        }
        if(currentSignal!=null)
          finalSignal.push(currentSignal);
        else
          finalSignal.push(asignal);
      }
      return finalSignal;
    }

    private httpOptionsUpdate = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };

    callServer(message:Message): Observable<Message>
    {
      return this.http.put<Message>(this.callServerUrl,message,this.httpOptionsUpdate);
    }

    moveToPrepare(toPrepare:ToPrepareI): Observable<ToPrepareI>
    {
      return this.http.put<ToPrepareI>(this.moveToPrepareUrl,toPrepare, this.httpOptionsUpdate);
    }

    speak(message: string): Observable<AudioI>
    {
      return this.http.put<AudioI>(this.speakUrl,{text:message} as AudioI,this.httpOptionsUpdate);
    }

    moveToPrepared(prepare:PrepareI): Observable<PrepareI>
    {
      return this.http.put<PrepareI>(this.moveToPreparedUrl,prepare, this.httpOptionsUpdate);
    }

    getToPrepare(role: string):Observable<ToPrepareI[]>
    {
      return this.http.get<ToPrepareI[]>(this.findToPrepareUrl+role);
    }

    getSignalOrder(role: string): Observable<OrderI[]>
    {
        return this.http.get<OrderI[]>(this.findSignalOrderUrl+role);
    }

    getToTakeOrder(role: string): Observable<OrderI[]>
    {
        return this.http.get<OrderI[]>(this.findToTakeOrderURL+role);
    }


  constructor(private http: HttpClient) { }
}