import { AppDataSource } from "../data-source";
import { Analysis } from "./analysis.entity";
import { HTTPException } from "hono/http-exception";
import { ProjectService } from "../project/project.service";

const projectService = new ProjectService();

export class AnalysisService {
  private analysisRepository = AppDataSource.getRepository(Analysis);

  async findAll(projectId: number) {
    return this.analysisRepository.find({ where: { projectId } });
  }

  async checkProjectExists(projectId: number) {
    const project = await projectService.findById(projectId);
    if (!project) {
      throw new HTTPException(404, { message: "Project not found" });
    }
  }

  async findById(id: number, projectId: number) {
    await this.checkProjectExists(projectId);
    const analysis = await this.analysisRepository.findOneBy({ id, projectId });
    if (!analysis) {
      throw new HTTPException(404, { message: "Analysis not found" });
    }
    return analysis;
  }

  async create(projectId: number, analysis: Analysis) {
    await this.checkProjectExists(projectId);
    return this.analysisRepository.save({ ...analysis, projectId });
  }

  async update(id: number, projectId: number, analysis: Analysis) {
    await this.findById(id, projectId);
    return this.analysisRepository.update(id, { ...analysis, projectId });
  }

  async patch(id: number, projectId: number, analysis: Partial<Analysis>) {
    const existingAnalysis = await this.findById(id, projectId);
    return this.analysisRepository.update(id, {
      ...existingAnalysis,
      ...analysis,
      projectId,
    });
  }

  async delete(id: number, projectId: number) {
    try {
      const analysis = await this.analysisRepository.findOneBy({
        id,
        projectId,
      });

      if (!analysis) {
        throw new HTTPException(404, { message: "Analysis not found" });
      }

      const result = await this.analysisRepository.delete(id);

      return result;
    } catch (error) {
      console.error("Error deleting analysis:", error);
      throw error;
    }
  }
}
