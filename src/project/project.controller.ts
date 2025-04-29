import { Context } from "hono";
import { ProjectService } from "./project.service";
import { Project } from "./project.entity";

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
    const id = Number(c.req.param("projectId"));
    const project = await this.projectService.findById(id);

    if (!project) {
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json(project, 200);
  };

  create = async (c: Context) => {
    const data = await c.req.json();
    const { userIds, ...projectData } = data;

    // Récupérer l'ID de l'utilisateur connecté depuis le middleware d'authentification
    const user = c.get("user");
    if (user) {
      projectData.createdById = user.id;
    }

    const project = await this.projectService.create(projectData, userIds);
    return c.json(project, 201);
  };

  update = async (c: Context) => {
    const id = Number(c.req.param("projectId"));
    const data = await c.req.json();
    const { userIds, ...projectData } = data;

    const project = await this.projectService.update(id, projectData, userIds);

    if (!project) {
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json(project, 200);
  };

  delete = async (c: Context) => {
    const id = Number(c.req.param("projectId"));
    const success = await this.projectService.delete(id);

    if (!success) {
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json({ message: "Project deleted" });
  };
}
