import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import {environment} from '../environement/environement'
import {Message} from '../model/interfaces/Message'
import {ToPrepareI} from '../model/interfaces/tracability/ToPrepare'
import {PrepareI} from '../model/interfaces/tracability/Prepare'
import {OrderI} from '../model/interfaces/tracability/Order'

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