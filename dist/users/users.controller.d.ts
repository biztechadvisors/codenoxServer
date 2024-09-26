import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { DealerDto } from './dto/add-dealer.dto';
import { Dealer } from './entities/dealer.entity';
import { DealerEnquiry } from './entities/delaerForEnquiry.entity';
import { CreateDealerEnquiryDto, UpdateDealerEnquiryDto } from './dto/createDealerEnquiryDto.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    getAllUsers(query: GetUsersDto): Promise<import("./dto/get-users.dto").UserPaginator>;
    getUser(id: string): Promise<import("./entities/user.entity").User>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    removeUser(id: string): Promise<string>;
    activeUser(id: number): Promise<import("./entities/user.entity").User>;
    banUser(id: number): Promise<import("./entities/user.entity").User>;
    makeAdmin(id: number): Promise<import("./entities/user.entity").User>;
}
export declare class ProfilesController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createProfile(createProfileDto: CreateProfileDto): Promise<import("./entities/profile.entity").Profile>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<import("./entities/profile.entity").Profile>;
    deleteProfile(id: number): Promise<string>;
}
export declare class DealerController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createDealer(dealerData: DealerDto): Promise<Dealer>;
    getAllDealers(createdBy: number): Promise<Dealer[]>;
    getDealerById(id: number): Promise<Dealer>;
    updateDealer(id: number, dealerData: DealerDto): Promise<Dealer>;
    deleteDealer(id: number): Promise<void>;
}
export declare class DealerEnquiryController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createDealerEnquiryDto: CreateDealerEnquiryDto): Promise<DealerEnquiry>;
    findAll(shopSlug: string): Promise<DealerEnquiry[]>;
    findOne(id: number): Promise<DealerEnquiry>;
    update(id: number, updateDealerEnquiryDto: UpdateDealerEnquiryDto): Promise<DealerEnquiry>;
    remove(id: number): Promise<void>;
}
