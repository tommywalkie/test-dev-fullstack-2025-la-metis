import { AppDataSource } from "../data-source";
import { User } from "./user.entity";
import { HTTPException } from "hono/http-exception";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async findAll() {
    return this.userRepository.find();
  }

  async findById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    return user;
  }

  async create(user: Partial<User>) {
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>) {
    await this.findById(id);
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.userRepository.delete(id);
  }
}
