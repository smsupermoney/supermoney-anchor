declare module "bcryptjs" {
  export function hash(password: string, rounds: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  export function hashSync(password: string, salt: string): string;
  export function compareSync(password: string, hash: string): boolean;
  export function getRounds(hash: string): number;
  export function getSalt(hash: string): string;
}
