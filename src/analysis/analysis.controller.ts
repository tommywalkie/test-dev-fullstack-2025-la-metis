import type { Context } from "hono";
import { AnalysisService } from "./analysis.service";

const analysisService = new AnalysisService();

export class AnalysisController {
  async findAll(c: Context) {
    const projectId = parseInt(c.req.param("projectId"));
    const user = c.get("user");

    const analyses = await analysisService.findAll(projectId, user.id);
    return c.json(analyses, 200);
  }

  async findById(c: Context) {
    const projectId = parseInt(c.req.param("projectId"));
    const analysisId = parseInt(c.req.param("analysisId"));
    const user = c.get("user");

    const analysis = await analysisService.findById(
      analysisId,
      projectId,
      user.id
    );
    return c.json(analysis, 200);
  }

  async create(c: Context) {
    const projectId = parseInt(c.req.param("projectId"));
    const body = await c.req.json();
    const user = c.get("user");

    const analysis = await analysisService.create(projectId, body, user.id);
    return c.json(analysis, 201);
  }

  async update(c: Context) {
    const projectId = parseInt(c.req.param("projectId"));
    const analysisId = parseInt(c.req.param("analysisId"));
    const body = await c.req.json();
    const user = c.get("user");

    const analysis = await analysisService.update(
      analysisId,
      projectId,
      body,
      user.id
    );
    return c.json(analysis, 200);
  }

  async delete(c: Context) {
    const projectId = parseInt(c.req.param("projectId"));
    const analysisId = parseInt(c.req.param("analysisId"));
    const user = c.get("user");

    await analysisService.delete(analysisId, projectId, user.id);
    return c.json({ message: "Analysis deleted" }, 200);
  }
}
