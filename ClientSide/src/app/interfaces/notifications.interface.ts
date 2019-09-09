import { UserInformation } from './user.data.interface';

export interface NotificationInterface {
    user: UserInformation,
    message: string,
    type: string
}