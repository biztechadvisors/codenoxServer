import { Repository } from "typeorm";
import { CustomRepository } from "../typeorm-ex/typeorm-ex.decorator";
import { Permission } from "./entities/permission.entity";

@CustomRepository(Permission)
export class PermissionRepository extends Repository<Permission> { }