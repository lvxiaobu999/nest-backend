import { Test, TestingModule } from '@nestjs/testing';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  const prismaService = {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent deleting a role bound to users', async () => {
    prismaService.role.findUnique.mockResolvedValue({
      _count: {
        users: 2,
      },
    });

    await expect(service.remove('role-1')).rejects.toBeInstanceOf(BusinessException);
    await expect(service.remove('role-1')).rejects.toMatchObject({
      response: {
        message: '该角色已经绑定用户，不能删除',
        code: 10002,
      },
    });
    expect(prismaService.role.delete).not.toHaveBeenCalled();
  });

  it('should delete a role when no users are bound', async () => {
    const result = {
      id: 'role-1',
      name: '管理员',
      code: 'admin',
      desc: null,
      enabled: true,
      menus: [],
      permissions: [],
      _count: {
        users: 0,
        menus: 0,
        permissions: 0,
      },
    };

    prismaService.role.findUnique.mockResolvedValue({
      _count: {
        users: 0,
      },
    });
    prismaService.role.delete.mockResolvedValue(result);

    await expect(service.remove('role-1')).resolves.toEqual(result);
    expect(prismaService.role.delete).toHaveBeenCalledWith({
      where: { id: 'role-1' },
      include: {
        menus: {
          select: {
            id: true,
            title: true,
            path: true,
            enabled: true,
          },
        },
        permissions: {
          select: {
            id: true,
            name: true,
            code: true,
            enabled: true,
          },
        },
        _count: {
          select: {
            users: true,
            menus: true,
            permissions: true,
          },
        },
      },
    });
  });
});
