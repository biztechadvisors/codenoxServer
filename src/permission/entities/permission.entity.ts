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

  @OneToMany(() => PermissionType, (permissionType) => permissionType.permissions, { cascade: true, onDelete: "CASCADE" })
  permissions: PermissionType[];

  @Column()
  user: number;

  @Column()
  shop: number;

  @ManyToMany(() => Shop, (shop) => shop.additionalPermissions, { onUpdate: "CASCADE" })
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

  @ManyToOne(() => Permission, permission => permission.permissions, { onDelete: "SET NULL" })
  permissions: Permission;
}
