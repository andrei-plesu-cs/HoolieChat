import { UserInformation } from './user.data.interface';

export interface RequestInterface {
    source_user: UserInformation,
    destination_user: UserInformation
}