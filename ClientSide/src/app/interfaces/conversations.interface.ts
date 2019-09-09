import { UserInformation } from './user.data.interface';

export interface ConversationsInterface {
    type: string,
    users: UserInformation | UserInformation[]
}