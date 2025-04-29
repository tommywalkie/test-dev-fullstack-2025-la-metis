import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";
import { Analysis } from "../analysis/analysis.entity";

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

  @OneToMany(() => Analysis, (analysis) => analysis.project, {
    cascade: true,
    onDelete: "CASCADE",
  })
  analyses: Analysis[];
}
