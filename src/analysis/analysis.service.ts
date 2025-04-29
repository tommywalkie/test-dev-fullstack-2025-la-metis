import { AppDataSource } from "../data-source";
import { Analysis } from "./analysis.entity";
import { HTTPException } from "hono/http-exception";
import { ProjectService } from "../project/project.service";
import { UserService } from "../user/user.service";

export class AnalysisService {
  private analysisRepository = AppDataSource.getRepository(Analysis);
  private projectService = new ProjectService();
  private userService = new UserService();

  async findAll(projectId: number, userId: number) {
    // First check if the user has access to the project
    const project = await this.projectService.findById(projectId, userId);

    // If project doesn't exist or user doesn't have access, return empty array
    // instead of throwing an error
    if (!project) {
      return [];
    }

    return this.analysisRepository.find({ where: { projectId } });
  }

  async findById(id: number, projectId: number, userId: number) {
    // First check if the user has access to the project
    const project = await this.projectService.findById(projectId, userId);
    if (!project) {
      throw new HTTPException(404, { message: "Project not found" });
    }

    const analysis = await this.analysisRepository.findOneBy({ id, projectId });
    if (!analysis) {
      throw new HTTPException(404, { message: "Analysis not found" });
    }
    return analysis;
  }

  async create(projectId: number, analysis: Analysis, userId: number) {
    try {
      // First get the user to check role
      const user = await this.userService.findById(userId);

      // Check if user is a reader (readers can't create analyses)
      if (user.role === "reader") {
        throw new HTTPException(403, {
          message: "Readers cannot create analyses",
        });
      }

      // Get the project (without access check first)
      const project = await this.projectService.findById(projectId, null);

      // If project doesn't exist, return 404
      if (!project) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      // For managers, check if they created the project
      if (user.role === "manager" && project.createdById !== userId) {
        throw new HTTPException(403, {
          message:
            "Managers can only create analyses for projects they created",
        });
      }

      // Now check if user has access to the project
      const projectWithAccess = await this.projectService.findById(
        projectId,
        userId
      );
      if (!projectWithAccess) {
        throw new HTTPException(403, {
          message: "Access denied to this project",
        });
      }

      // User has permission, create the analysis
      return this.analysisRepository.save({ ...analysis, projectId });
    } catch (error) {
      // Re-throw HTTPExceptions
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Error creating analysis" });
    }
  }

  async update(
    id: number,
    projectId: number,
    analysis: Analysis,
    userId: number
  ) {
    try {
      // First get the user to check role
      const user = await this.userService.findById(userId);

      // Get the project (without access check first)
      const project = await this.projectService.findById(projectId, null);

      // If project doesn't exist, return 404
      if (!project) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      // Check if user is admin or project creator
      if (user.role !== "admin" && project.createdById !== userId) {
        throw new HTTPException(403, {
          message: "Only admins or project creators can update analyses",
        });
      }

      // Now check if user has access to the project
      const projectWithAccess = await this.projectService.findById(
        projectId,
        userId
      );
      if (!projectWithAccess) {
        throw new HTTPException(403, {
          message: "Access denied to this project",
        });
      }

      // Check if analysis exists
      const existingAnalysis = await this.analysisRepository.findOneBy({
        id,
        projectId,
      });

      if (!existingAnalysis) {
        throw new HTTPException(404, { message: "Analysis not found" });
      }

      // User has permission, update the analysis
      await this.analysisRepository.update(id, { ...analysis, projectId });

      // Return the updated analysis
      return this.analysisRepository.findOneBy({ id, projectId });
    } catch (error) {
      // Re-throw HTTPExceptions
      if (error instanceof HTTPException) {
        throw error;
      }
      console.log("Unknown error updating analysis", error);
      throw new HTTPException(500, { message: "Error updating analysis" });
    }
  }

  async delete(id: number, projectId: number, userId: number) {
    try {
      // First get the user to check role
      const user = await this.userService.findById(userId);

      // Get the project (without access check first)
      const project = await this.projectService.findById(projectId, null);

      // If project doesn't exist, return 404
      if (!project) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      // Check if user is admin or project creator
      if (user.role !== "admin" && project.createdById !== userId) {
        throw new HTTPException(403, {
          message: "Only admins or project creators can delete analyses",
        });
      }

      // Now check if user has access to the project
      const projectWithAccess = await this.projectService.findById(
        projectId,
        userId
      );
      if (!projectWithAccess) {
        throw new HTTPException(403, {
          message: "Access denied to this project",
        });
      }

      // Check if analysis exists
      const existingAnalysis = await this.analysisRepository.findOneBy({
        id,
        projectId,
      });

      if (!existingAnalysis) {
        throw new HTTPException(404, { message: "Analysis not found" });
      }

      // User has permission, delete the analysis
      const result = await this.analysisRepository.delete(id);
      return result;
    } catch (error) {
      // Re-throw HTTPExceptions
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Error deleting analysis" });
    }
  }
}
