/* eslint-disable prettier/prettier */
import { Shop } from "src/shops/entities/shop.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;

  @Column()
  permission_name: string;

  @OneToMany(() => PermissionType, PermissionType => PermissionType.permissions)
  permissions: PermissionType[];

  @Column()
  user: number;

  @Column()
  shop: number;

  @ManyToMany(() => Shop, (shop) => shop.additionalPermissions)
  @JoinTable({ name: 'shop_permission' })
  shops?: Shop[];
}

@Entity()
export class PermissionType {
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