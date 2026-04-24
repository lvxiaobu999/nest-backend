import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  const prismaService = {
    permission: {
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
        PermissionsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should filter permissions by query params', async () => {
    prismaService.permission.findMany.mockResolvedValue([]);

    await expect(
      service.findAll({
        menuId: 'menu-1',
        name: '用户',
        code: 'user',
        enabled: true,
      }),
    ).resolves.toEqual([]);

    expect(prismaService.permission.findMany).toHaveBeenCalledWith({
      where: {
        menuId: 'menu-1',
        enabled: true,
        name: {
          contains: '用户',
          mode: 'insensitive',
        },
        code: {
          contains: 'user',
          mode: 'insensitive',
        },
      },
      include: {
        menu: {
          select: {
            id: true,
            title: true,
            path: true,
            enabled: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            enabled: true,
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: {
        createTime: 'desc',
      },
    });
  });

  it('should create permission with default enabled status', async () => {
    const result = {
      id: 'permission-1',
      name: '用户列表',
      code: 'user:list',
      remark: null,
      enabled: true,
      menu: null,
      roles: [],
      _count: {
        roles: 0,
      },
    };

    prismaService.permission.create.mockResolvedValue(result);

    await expect(
      service.create({
        name: '用户列表',
        code: 'user:list',
      }),
    ).resolves.toEqual(result);

    expect(prismaService.permission.create).toHaveBeenCalledWith({
      include: {
        menu: {
          select: {
            id: true,
            title: true,
            path: true,
            enabled: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            enabled: true,
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
      data: {
        name: '用户列表',
        code: 'user:list',
        remark: undefined,
        enabled: true,
        menuId: undefined,
      },
    });
  });

  it('should delete permission with relation payload', async () => {
    const result = {
      id: 'permission-1',
      name: '用户列表',
      code: 'user:list',
      remark: null,
      enabled: true,
      menu: null,
      roles: [],
      _count: {
        roles: 0,
      },
    };

    prismaService.permission.delete.mockResolvedValue(result);

    await expect(service.remove('permission-1')).resolves.toEqual(result);
    expect(prismaService.permission.delete).toHaveBeenCalledWith({
      where: { id: 'permission-1' },
      include: {
        menu: {
          select: {
            id: true,
            title: true,
            path: true,
            enabled: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            enabled: true,
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });
  });
});
