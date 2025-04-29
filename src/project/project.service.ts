import { AppDataSource } from "../data-source";
import { Project } from "./project.entity";
import { ProjectUser } from "./project-user.entity";
import { User } from "../user/user.entity";
import { HTTPException } from "hono/http-exception";

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectUserRepository = AppDataSource.getRepository(ProjectUser);
  private userRepository = AppDataSource.getRepository(User);

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ["createdBy", "projectUsers", "projectUsers.user"],
    });
  }

  async findById(id: number): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ["createdBy", "projectUsers", "projectUsers.user"],
    });
  }

  async create(data: Partial<Project>, userIds?: number[]): Promise<Project> {
    // Créer le projet
    const project = this.projectRepository.create(data);
    await this.projectRepository.save(project);

    // Associer les utilisateurs si fournis
    if (userIds && userIds.length > 0) {
      await this.updateProjectUsers(project.id, userIds);
    }

    return this.findById(project.id) as Promise<Project>;
  }

  async update(
    id: number,
    data: Partial<Project>,
    userIds?: number[]
  ): Promise<Project | null> {
    // Vérifier que le projet existe
    const project = await this.findById(id);
    if (!project) {
      return null;
    }

    // Mettre à jour les propriétés du projet
    if (data.name) {
      project.name = data.name;
    }

    await this.projectRepository.save(project);

    // Mettre à jour les utilisateurs associés si fournis
    if (userIds !== undefined) {
      await this.updateProjectUsers(id, userIds);
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const project = await this.findById(id);
    if (!project) {
      return false;
    }

    await this.projectRepository.remove(project);
    return true;
  }

  // Méthode privée pour mettre à jour les utilisateurs associés à un projet
  private async updateProjectUsers(
    projectId: number,
    userIds: number[]
  ): Promise<void> {
    // Supprimer les associations existantes
    await this.projectUserRepository.delete({ projectId });

    // Créer les nouvelles associations
    for (const userId of userIds) {
      // Vérifier que l'utilisateur existe
      const user = await this.userRepository.findOneBy({ id: userId });
      if (user) {
        const projectUser = this.projectUserRepository.create({
          projectId,
          userId,
        });
        await this.projectUserRepository.save(projectUser);
      }
    }
  }
}
