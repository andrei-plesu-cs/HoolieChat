import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { WebSocketService } from '../web-socket.service';
import { UserInformation } from '../interfaces/user.data.interface';
import { NotificationInterface } from '../interfaces/notifications.interface';
import { ConversationsInterface } from '../interfaces/conversations.interface';
import { MessageInterface } from '../interfaces/message.interface';

interface CompleteMessageInterface {
  message: MessageInterface,
  source_user: string
}

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})
export class MainScreenComponent implements OnInit {

  //The username choosen by the user
  username: string;
  users: UserInformation[] = [];
  showButtons: boolean[] = [];
  displayButton: boolean[] = []; //for the request buttons in the notifications area
  notifications: NotificationInterface[] = [];
  conversations: ConversationsInterface[] = [];
  isPeopleSelected: boolean = true;
  convSelected: boolean = false;
  currentMessages: [MessageInterface[]] = [[]];
  newMessagesCount: number[] = [];
  timeOfConnection: number[] = [];
  totalNewMessages: number = 0;

  messages: MessageInterface[];
  convInfo: ConversationsInterface

  constructor(
    private activateRouter: ActivatedRoute,
    private socketService: WebSocketService
    ) { }

  ngOnInit() {
    this.activateRouter.queryParams
      .subscribe((params: Params) => {
        this.username = params.username;
      });


    //trying to connect to the server through socket.io
    this.socketService.establishConnection(this.username);
    this.socketService.listenToUsers()
      .subscribe(
        ((result) => {
          result.forEach((element: UserInformation) => {
            if (element.username !== this.username && ! this.users.includes(element)) {
              if (! this.timeOfConnection[element.username]) {
                this.timeOfConnection[element.username] = Date.now();
              }

              this.users.push(element)
            }
          })
          console.log(this.users);
        }), 
        (error: Error) => {
          console.log(error.message);
        });

    //listen to requests
    this.socketService.listenToAddRequest()
        .subscribe(
          (result) => {
            let message = `sent you a brand new personal request`
            let type = 'personal_request'
            this.notifications.push({
              message: message,
              type: type,
              user: result.source_user
            });
           } ,
        (error: Error) => {
          console.log(error.message);
        }
        )

    this.socketService.listenToAddResponse()
        .subscribe(
          (result) => {
            let message = '';
            let type = '';
            if (result.data.responseVerb) {
              message = `has accepted your personal request`;
              type = 'response_success';
              
              this.conversations.push({
                type: 'single_user',
                users: result.source_user
              });

            } else {
              message = `has rejected your personal request`;
              type = 'response_failure';
            }

            this.notifications.push({
              message: message,
              type: type,
              user: {
                username: result.source_user.username,
                socket_id: result.source_user.socket_id
              }
            });
          }
        )

    this.socketService.receiveMessageFromUser()
      .subscribe(result => {
        console.log('Da:', result.source_user.username);

        if (!this.currentMessages[result.source_user.username]) {
          this.currentMessages[result.source_user.username] = [];
        }

        this.currentMessages[result.source_user.username]
          .push({
            is_sender: false,
            message: result.message,
            username: result.source_user.username
          });

        this.notifications.push({
          message: 'sent you a message',
          user: result.source_user,
          type: 'normal_message'
        })


        //add a new message to unread messages from incoming user
        if (! this.newMessagesCount[result.source_user.username]) {
          this.newMessagesCount[result.source_user.username] = 0;
        }
        this.newMessagesCount[result.source_user.username] += 1;
        this.totalNewMessages += 1;

      },
      (error: Error) => {
        console.log('This I got is an error...');
    })

    this.socketService.listenToExitConv()
      .subscribe((result: any) => {
        this.conversations.filter((conversation: ConversationsInterface) => {
          if (conversation.type !== 'single_user') {
            return true;
          } else {
            let user = <UserInformation> conversation.users;
            return user.username === result.source_user.username;
          }
        })
      })

  }

  //for when the button section is clicked
  clickButton(index: number): void {
    if (this.showButtons[index]) {
      this.showButtons = [];
    } else {
      this.showButtons = [];
      this.showButtons[index] = true;
    }

  }

  //send a request to the given user
  sendRequest(user: UserInformation): void {
    this.socketService.sendAddRequest(user, this.username);
    this.showButtons = [];
  }

  //delete the given user from the list
  deleteUser(user: UserInformation): void {
    this.showButtons = [];
  }

  sendResponse(user: UserInformation, response: boolean, index: number): void {

    if (response === true) {

      //add the 'added' person to the conversations tab
      this.conversations.push({
        type: 'single_user',
        users: user
      });
      this.notifications.push({
        message: 'is now your friend',
        user: user,
        type: 'response_success'
      })
    } else {
      this.notifications.push({
        message: 'got rejected by you :(',
        user: user,
        type: 'normal_message'
      })
    }

    this.displayButton[index] = true;
    this.socketService.sendAddResponse(user, response, this.username);
  }

  getConv(type: string): ConversationsInterface[] {
    return this.conversations.filter((conversation: ConversationsInterface) => {
      return conversation.type === type;
    })
  }

  messageUsers(conversation: ConversationsInterface): void {
    this.convInfo = conversation;
    if (conversation.type === 'single_user') {
      let user = <UserInformation> conversation.users;
      console.log('Aici:', user.username)
      if (! this.currentMessages[user.username]) {
        this.messages = [];
      } else {
        this.messages = this.currentMessages[user.username];
      }

      if (this.newMessagesCount[user.username]) {
        this.totalNewMessages -= this.newMessagesCount[user.username];
        this.newMessagesCount[user.username] = 0;
      }

    }

    this.showButtons = [];
    this.convSelected = true;
  }

  exitConversations(conversation: ConversationsInterface): void {

    if (conversation.type !== 'single_user') {
      return;
    }

    let user = <UserInformation> conversation.users;
    this.conversations.filter((conversation: ConversationsInterface) => {
      if (conversation.type !== 'single_user') {
        return true;
      } else {
        let temp_user = <UserInformation> conversation.users;
        return user.username === temp_user.username;
      }
    })

    this.socketService.exitConversation(this.username, user);
    this.showButtons = [];
  }

  saveTheMessage(message: CompleteMessageInterface): void {

    console.log('I enter this place to be honest...')
    console.log(message.source_user)

    if (!this.currentMessages[message.source_user]) {
      this.currentMessages[message.source_user] = [];
    }

    this.currentMessages[message.source_user]
      .push(message.message);

    this.messages = this.currentMessages[message.source_user];

  }

  formatDate(username: string): string {

    if (!this.timeOfConnection[username]) {
      return 'No data for this user :(';
    }

    let now_date = Date.now();
    let connection_time = Math.floor((now_date - this.timeOfConnection[username])/60000);
    if (connection_time === 0) {
      return 'Connected now';
    } else if (connection_time === 1) {
      return 'Connected 1 minute ago';
    } else {
      return `Connected ${connection_time} minutes ago`;
    }

  }

}
