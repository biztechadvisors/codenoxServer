import { User } from "./user.entity";
import { Attachment } from "src/common/entities/attachment.entity";
import { CoreEntity } from "src/common/entities/core.entity";
export declare class Social {
    id: number;
    type: string;
    link: string;
}
export declare class Profile extends CoreEntity {
    id: number;
    avatar: Attachment;
    bio?: string;
    socials?: Social;
    contact?: string;
    customer?: User;
}
