import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable, observable } from 'rxjs';
import { UserInformation } from './interfaces/user.data.interface';
import { ResponseInterface } from './interfaces/response.interface';
import { RequestInterface } from './interfaces/request.interface';
import { MessageInterface } from './interfaces/message.interface';

interface CompleteResponseInterface {
  data: ResponseInterface,
  source_user: UserInformation
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  //the socket used for the connection
  private socket;

  constructor() { }

  //establish a new connection to the server
  establishConnection(username: string): void {
    this.socket = io('http://localhost:8080');

    this.socket.on('connect', () => {
      console.log('I am connected to the server');
      this.socket.emit('userid', {username: username});
    });
  }

  listenToUsers(): Observable<UserInformation[]> {
    return new Observable(observer => {
      this.socket.on('clients_list', (clients: UserInformation[]) => {
        observer.next(clients);
      });
    })
  }

  //kill the socket connection to the server
  killServerConnection(username: string): void {
    this.socket.on('disconnect', () => {
      console.log('I disconnected');
    })
  }

  sendAddRequest(user: UserInformation, source_username): void {
    this.socket.emit('add_request', user, source_username);
  }

  listenToAddRequest(): Observable<RequestInterface> {
    return new Observable(observer => {
      this.socket.on('add_request', (data: UserInformation, source_data: UserInformation) => {
        observer.next({
          destination_user: data,
          source_user: source_data
        });
      })
    })
  };

  sendAddResponse(user: UserInformation, addResponseVerb: boolean, source_username: string): void {
    this.socket.emit('add_response', {
      ...user,
      responseVerb: addResponseVerb
    }, source_username);
  };

  listenToAddResponse(): Observable<CompleteResponseInterface> {
    return new Observable(observer => {
      this.socket.on('add_response', (data, source_user) => {
        observer.next({
          data: data,
          source_user: source_user
        });
      })
    })
  }


  //send message to a user or a group
  //send message to a user 
  sendMessageToUser(username: string, message: string, dest_user: UserInformation): void {
    this.socket.emit('send_message', message, username, dest_user);
  }

  receiveMessageFromUser(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receive_message', (message: string, source_user: UserInformation) => {
        console.log('Merge macar aici...');
        observer.next({
          source_user: source_user,
          message: message
        })
      })
    })
  }

  //exit a conversation
  exitConversation(source_username: string, dest_user: UserInformation): void {
    this.socket.emit('exit_conversation', source_username, dest_user);
  }

  listenToExitConv(): Observable<any> {
    return new Observable(observable => {
      this.socket.on('exit_conversation', (source_user, dest_user) => {
        observable.next({
          dest_user: dest_user,
          source_user: source_user
        })
      })
    })
  }

}
