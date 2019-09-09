import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageInterface } from '../interfaces/message.interface';
import { WebSocketService } from '../web-socket.service';
import { ConversationsInterface } from '../interfaces/conversations.interface';
import { UserInformation } from '../interfaces/user.data.interface';

interface CompleteMessageInterface {
  message: MessageInterface,
  source_user: string
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  //the message component receives a userid and opens a local file where are the messages of that conversation
  @Input('newMessages') messages: MessageInterface[] = [];
  @Input('convInfo') convInfo: ConversationsInterface;
  @Input('user') user: string;
  @Output('saveMessage') saveMessage: EventEmitter<CompleteMessageInterface> = new EventEmitter<CompleteMessageInterface>()
  inputField: string = '';

  constructor(
    private socketService: WebSocketService
  ) { }

  ngOnInit() {

  }

  //formats the names from the conversation
  formatNames(): string {
    if (this.convInfo.type === 'single_user') {
      let user = <UserInformation> this.convInfo.users;
      return user.username
    } else {
      let names = ''
      let users = <UserInformation[]> this.convInfo.users;
      users.forEach((user: UserInformation) => {
        names += user.username + ', ';
      })

      return names.substring(0, names.length-2)
      
    }
  }

  sendMessage(): void {
    if (this.inputField === '') {
      return;
    } else {

      if (this.convInfo.type === 'single_user') {
        let user = <UserInformation> this.convInfo.users;
        console.log('Utilizatorul: ', user)
        this.socketService.sendMessageToUser(this.user, this.inputField, user)

        this.saveMessage.emit({
          message: {
          message: this.inputField,
          username: this.user,
          is_sender: true
        }, 
        source_user: user.username})

      }

      this.inputField = '';

    }
  }

  formatUsername(message: MessageInterface): string {
    if(message.username === this.user) {
      return 'Me';
    } else {
      return message.username;
    }
  }

}
