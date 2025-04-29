import type { Context } from "hono";
import { AnalysisService } from "./analysis.service";

const analysisService = new AnalysisService();

export class AnalysisController {
  async findAll(c: Context) {
    const projectId = c.req.param("projectId");
    const analyses = await analysisService.findAll(parseInt(projectId));
    return c.json(analyses, 200);
  }

  async findById(c: Context) {
    const { projectId, analysisId } = c.req.param();
    const analysis = await analysisService.findById(
      parseInt(projectId),
      parseInt(analysisId)
    );
    return c.json(analysis, 200);
  }

  async create(c: Context) {
    const { projectId } = c.req.param();
    const body = await c.req.json();
    const analysis = await analysisService.create(parseInt(projectId), body);
    return c.json(analysis, 201);
  }

  async update(c: Context) {
    const { projectId, analysisId } = c.req.param();
    const body = await c.req.json();
    const analysis = await analysisService.update(
      parseInt(analysisId),
      parseInt(projectId),
      body
    );
    return c.json(analysis, 200);
  }

  async delete(c: Context) {
    const { projectId, analysisId } = c.req.param();
    await analysisService.delete(parseInt(analysisId), parseInt(projectId));
    return c.json({ message: "Analysis deleted" }, 200);
  }
}
