import { AppDataSource } from "../data-source";
import { Project } from "./project.entity";
import { ProjectUser } from "./project-user.entity";
import { User } from "../user/user.entity";
import { HTTPException } from "hono/http-exception";

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectUserRepository = AppDataSource.getRepository(ProjectUser);
  private userRepository = AppDataSource.getRepository(User);

  async findAll(userId: number): Promise<Project[]> {
    // First, check if the user is an admin or manager
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // If user is an admin, return all projects
    if (user && user.role === "admin") {
      return this.projectRepository.find({
        relations: ["createdBy", "projectUsers", "projectUsers.user"],
      });
    }

    // For non-admin users, filter to only show projects they have access to
    return this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.createdBy", "createdBy")
      .leftJoinAndSelect("project.projectUsers", "projectUsers")
      .leftJoinAndSelect("projectUsers.user", "user")
      .where(
        "project.createdById = :userId OR EXISTS (SELECT 1 FROM project_user pu WHERE pu.projectId = project.id AND pu.userId = :userId)",
        { userId }
      )
      .getMany();
  }

  async findById(
    id: number,
    userId: number | null = null
  ): Promise<Project | null> {
    // If no userId is provided, just fetch the project without access check
    if (userId === null) {
      return this.projectRepository.findOne({
        where: { id },
        relations: ["createdBy", "projectUsers", "projectUsers.user"],
      });
    }

    // Check if user is admin (admins can access all projects)
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user && user.role === "admin") {
      return this.projectRepository.findOne({
        where: { id },
        relations: ["createdBy", "projectUsers", "projectUsers.user"],
      });
    }

    // For non-admin users, find the project first
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ["createdBy", "projectUsers", "projectUsers.user"],
    });

    // If project doesn't exist, return null
    if (!project) {
      return null;
    }

    // Check if user has access to this project (either as creator or assigned user)
    const hasAccess =
      project.createdById === userId ||
      project.projectUsers.some((pu) => pu.userId === userId);

    return hasAccess ? project : null;
  }

  async create(data: Partial<Project>, userIds?: number[]): Promise<Project> {
    // Create the project
    const project = this.projectRepository.create(data);
    await this.projectRepository.save(project);

    // Associate users if provided
    if (userIds && userIds.length > 0) {
      await this.updateProjectUsers(project.id, userIds);
    }

    // Use null to bypass access check for internal calls
    return this.findById(project.id, null) as Promise<Project>;
  }

  async update(
    id: number,
    data: Partial<Project>,
    userIds?: number[]
  ): Promise<Project | null> {
    // Check if project exists
    const project = await this.findById(id, null);
    if (!project) {
      return null;
    }

    // Update project properties
    if (data.name) {
      project.name = data.name;
    }

    await this.projectRepository.save(project);

    // Update associated users if provided
    if (userIds !== undefined) {
      await this.updateProjectUsers(id, userIds);
    }

    return this.findById(id, null);
  }

  async delete(id: number): Promise<boolean> {
    const project = await this.findById(id, null);
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
