import { AppDataSource } from "../data-source";
import { Project } from "./project.entity";
import { HTTPException } from "hono/http-exception";

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);

  async findAll() {
    return this.projectRepository.find();
  }

  async findById(id: number) {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) {
      throw new HTTPException(404, { message: "Project not found" });
    }
    return project;
  }

  async create(project: Project) {
    return this.projectRepository.save(project);
  }

  async update(id: number, project: Project) {
    await this.findById(id);
    return this.projectRepository.update(id, project);
  }

  async patch(id: number, project: Partial<Project>) {
    const existingProject = await this.findById(id);
    return this.projectRepository.update(id, {
      ...existingProject,
      ...project,
    });
  }

  async delete(id: number) {
    await this.findById(id);
    return this.projectRepository.delete(id);
  }
}
