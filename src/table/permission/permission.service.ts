import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async memberHasPermission(
    memberId: string,
    permission: string,
  ): Promise<boolean> {
    const result = await this.prisma.$queryRaw<
      [{ has_permission: boolean }]
    >`
      SELECT (
        (EXISTS (
          SELECT 1 FROM table_role_permissions trp
          JOIN table_members tm ON tm.table_role_id = trp.table_role_id
          WHERE tm.id = ${memberId} AND trp.permission = ${permission}
        )
        OR EXISTS (
          SELECT 1 FROM table_member_permissions tmp
          WHERE tmp.member_id = ${memberId}
            AND tmp.permission = ${permission}
            AND tmp.granted = true
        ))
        AND NOT EXISTS (
          SELECT 1 FROM table_member_permissions tmp
          WHERE tmp.member_id = ${memberId}
            AND tmp.permission = ${permission}
            AND tmp.granted = false
        )
      ) AS has_permission
    `;
    return result[0].has_permission;
  }
}
