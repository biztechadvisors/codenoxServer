/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;
  @Column()
  permission_name: string

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
