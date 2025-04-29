import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ProjectUser } from "../project/project-user.entity";

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  READER = "reader",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  name: string;

  @Column({
    type: "varchar",
    enum: UserRole,
    default: UserRole.READER,
  })
  role: UserRole;

  @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  // Relation avec les projets auxquels l'utilisateur a accès
  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  projectUsers: ProjectUser[];
}
