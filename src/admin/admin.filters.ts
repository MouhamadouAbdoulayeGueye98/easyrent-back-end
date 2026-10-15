import {
  Prisma,
  Role,
  PropertyStatus,
  PropertyType,
  VisitStatus,
} from '@prisma/client';

// Query params acceptés par les listes admin (tous optionnels)
export type AdminListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  status?: string;
  type?: string;
  isActive?: string;
};

// Ne garde la valeur que si elle existe dans l'enum (évite une erreur Prisma sur une valeur invalide)
function pickEnum<T extends Record<string, string>>(
  enumObj: T,
  value?: string,
): T[keyof T] | undefined {
  return value && (Object.values(enumObj) as string[]).includes(value)
    ? (value as T[keyof T])
    : undefined;
}

// Recherche insensible à la casse
const contains = (search: string) => ({
  contains: search,
  mode: 'insensitive' as const,
});

// GET /admin/users?search=&role=&isActive=
export function buildUserWhere(q: AdminListQuery): Prisma.UserWhereInput {
  const search = q.search?.trim();
  const role = pickEnum(Role, q.role);

  return {
    ...(role ? { role } : {}),
    ...(q.isActive === 'true' ? { isActive: true } : {}),
    ...(q.isActive === 'false' ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { name: contains(search) },
            { email: contains(search) },
            { phone: contains(search) },
          ],
        }
      : {}),
  };
}

// GET /admin/properties?search=&status=&type=
export function buildPropertyWhere(q: AdminListQuery): Prisma.PropertyWhereInput {
  const search = q.search?.trim();
  const status = pickEnum(PropertyStatus, q.status);
  const type = pickEnum(PropertyType, q.type);

  return {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { title: contains(search) },
            { city: contains(search) },
            { address: contains(search) },
            { quartier: contains(search) },
            { owner: { name: contains(search) } },
            { owner: { email: contains(search) } },
          ],
        }
      : {}),
  };
}

// GET /admin/visits?search=&status=
export function buildVisitWhere(q: AdminListQuery): Prisma.VisitRequestWhereInput {
  const search = q.search?.trim();
  const status = pickEnum(VisitStatus, q.status);

  return {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { property: { title: contains(search) } },
            { property: { city: contains(search) } },
            { tenant: { name: contains(search) } },
            { tenant: { email: contains(search) } },
          ],
        }
      : {}),
  };
}