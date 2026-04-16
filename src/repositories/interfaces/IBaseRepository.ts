export interface IBaseRepository<T> {
  getAll(): T[] | Promise<T[]>;
  getById(id: number | string): T | undefined | Promise<T | undefined>;
  create(item: Omit<T, "id">): T | Promise<T>;
  update(id: number | string, item: Partial<T>): void | Promise<void>;
  delete(id: number | string): void | Promise<void>;
}
