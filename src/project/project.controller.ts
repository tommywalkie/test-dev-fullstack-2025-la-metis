import { Context } from "hono";
import { ProjectService } from "./project.service";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  findAll = async (c: Context) => {
    // Get the authenticated user from the context
    const user = c.get("user");

    // Pass the user ID to the service to filter projects
    const projects = await this.projectService.findAll(user.id);
    return c.json(projects, 200);
  };

  findById = async (c: Context) => {
    const id = Number(c.req.param("projectId"));
    // Get the authenticated user from the context
    const user = c.get("user");

    // Pass the user ID to check project access
    const project = await this.projectService.findById(id, user.id);

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
