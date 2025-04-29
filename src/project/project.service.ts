import { AppDataSource } from "../data-source";
import { Project } from "./project.entity";
import { ProjectUser } from "./project-user.entity";
import { UserService } from "../user/user.service";
import { HTTPException } from "hono/http-exception";

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectUserRepository = AppDataSource.getRepository(ProjectUser);
  private userService = new UserService();

  async findAll(userId: number): Promise<Project[]> {
    // First, check if the user is an admin
    try {
      const user = await this.userService.findById(userId);

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
    } catch (error) {
      throw new HTTPException(500, { message: "Error retrieving projects" });
    }
  }

  async findById(
    id: number,
    userId: number | null = null
  ): Promise<Project | null> {
    try {
      // If no userId is provided, just fetch the project without access check
      if (userId === null) {
        return this.projectRepository.findOne({
          where: { id },
          relations: ["createdBy", "projectUsers", "projectUsers.user"],
        });
      }

      // Check if user is admin
      const user = await this.userService.findById(userId);

      // If user is an admin, return the project without further checks
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
    } catch (error) {
      throw new HTTPException(500, { message: "Error retrieving project" });
    }
  }

  async create(data: Partial<Project>, userIds?: number[]): Promise<Project> {
    try {
      // Create the project
      const project = this.projectRepository.create(data);
      await this.projectRepository.save(project);

      // Associate users if provided
      if (userIds && userIds.length > 0) {
        await this.updateProjectUsers(project.id, userIds);
      }

      // Use null to bypass access check for internal calls
      return this.findById(project.id, null) as Promise<Project>;
    } catch (error) {
      throw new HTTPException(500, { message: "Error creating project" });
    }
  }

  async update(
    id: number,
    data: Partial<Project>,
    userIds?: number[]
  ): Promise<Project | null> {
    try {
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
    } catch (error) {
      throw new HTTPException(500, { message: "Error updating project" });
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const project = await this.findById(id, null);
      if (!project) {
        return false;
      }

      await this.projectRepository.remove(project);
      return true;
    } catch (error) {
      throw new HTTPException(500, { message: "Error deleting project" });
    }
  }

  // Private method to update the users associated with a project
  private async updateProjectUsers(
    projectId: number,
    userIds: number[]
  ): Promise<void> {
    try {
      // Delete existing associations
      await this.projectUserRepository.delete({ projectId });

      // Create new associations
      for (const userId of userIds) {
        // Verify that the user exists
        try {
          const user = await this.userService.findById(userId);
          const projectUser = this.projectUserRepository.create({
            projectId,
            userId,
          });
          await this.projectUserRepository.save(projectUser);
        } catch (error) {
          // Skip users that don't exist
          console.warn(
            `User with ID ${userId} not found, skipping association`
          );
        }
      }
    } catch (error) {
      throw new HTTPException(500, { message: "Error updating project users" });
    }
  }
}
