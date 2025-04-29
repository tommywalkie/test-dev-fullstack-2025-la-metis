import { Context } from "hono";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  findAll = async (c: Context) => {
    const users = await this.userService.findAll();
    return c.json(users, 200);
  };

  findById = async (c: Context) => {
    const id = c.req.param("userId");
    const user = await this.userService.findById(parseInt(id));
    return c.json(user, 200);
  };

  create = async (c: Context) => {
    const payload = await c.req.json();
    const user = await this.userService.create(payload);
    return c.json(user, 201);
  };

  update = async (c: Context) => {
    const id = c.req.param("userId");
    const payload = await c.req.json();
    const user = await this.userService.update(parseInt(id), payload);
    return c.json(user, 200);
  };

  delete = async (c: Context) => {
    const id = c.req.param("userId");
    await this.userService.delete(parseInt(id));
    return c.json({ message: "User deleted" }, 200);
  };
}
