import { Role } from "@/orm/entities/types";

export type JwtPayload = {
  id: string;
  role: Role;
  issuer: string;
  provider: string;
};
