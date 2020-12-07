import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environement/environement'
import { UserI } from '../../model/interfaces/UserI';

@Injectable({
    providedIn: 'root'
})


export class UserService {
    private usersFindUrl = environment.apiUrl + '/config-users/find/';
    private usersInsertUrl = environment.apiUrl + '/config-users/insert/';
    private updatePasswordUrl = environment.apiUrl + '/config-users/updatePassword/';
    private updateRoleUrl = environment.apiUrl + '/config-users/updateRole/';
    private listRoleURL = environment.apiUrl + '/config-users/getAllRole/'
    private deleteUrl = environment.apiUrl + '/config-users/delete/';

    private httpOptionsUpdate = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    getUsers(): Observable<UserI[]> {
        return this.http.get<UserI[]>(this.usersFindUrl);
    }

    updateUserPassword(user: UserI): Observable<any> {
        return this.http.put(this.updatePasswordUrl, user, this.httpOptionsUpdate);
    }

    updateUsersRoles(user: UserI): Observable<any> {
        return this.http.put(this.updateRoleUrl, user, this.httpOptionsUpdate);
    }

    insertUser(user: UserI): Observable<UserI> {
        return this.http.put<UserI>(this.usersInsertUrl, user, this.httpOptionsUpdate);
    }

    getRoles(): Observable<string[]> {
        return this.http.get<string[]>(this.listRoleURL);
    }

    delete(user: UserI): Observable<any> {
        var finalUrl = this.deleteUrl + user.id;
        return this.http.delete(finalUrl);
    }

    constructor(private http: HttpClient) { }
}