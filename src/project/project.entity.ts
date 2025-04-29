import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Analysis } from "../analysis/analysis.entity";
import { ProjectUser } from "./project-user.entity";
import { User } from "../user/user.entity";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  name: string;

  @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  // Relation avec l'utilisateur qui a créé le projet
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: "int", nullable: true })
  createdById: number;

  // Relation avec les utilisateurs qui ont accès au projet
  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  projectUsers: ProjectUser[];

  @OneToMany(() => Analysis, (analysis) => analysis.project, {
    cascade: true,
    onDelete: "CASCADE",
  })
  analyses: Analysis[];
}
