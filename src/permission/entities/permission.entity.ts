/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { Permission } from "./Permission.entity"; // Import the Permission entity

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;

  
  @OneToMany(() => PermissionType, PermissionType => PermissionType.permissions)
  permissions: PermissionType[];
}

@Entity()
export class PermissionType {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  read: boolean;

  @Column()
  write: boolean;

  @ManyToOne(() => Permission, permission => permission.id)
  permissions: Permission;
}
