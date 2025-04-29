import { Context } from "hono";
import { ProjectService } from "./project.service";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  findAll = async (c: Context) => {
    const projects = await this.projectService.findAll();
    return c.json(projects, 200);
  };

  findById = async (c: Context) => {
    const id = c.req.param("projectId");
    const project = await this.projectService.findById(parseInt(id));
    return c.json(project, 200);
  };

  create = async (c: Context) => {
    const payload = await c.req.json();
    const project = await this.projectService.create(payload);
    return c.json(project, 201);
  };

  update = async (c: Context) => {
    const id = c.req.param("projectId");
    const payload = await c.req.json();
    const project = await this.projectService.update(parseInt(id), payload);
    return c.json(project, 200);
  };

  delete = async (c: Context) => {
    const id = c.req.param("projectId");
    await this.projectService.delete(parseInt(id));
    return c.json({ message: "Project deleted" }, 200);
  };
}
