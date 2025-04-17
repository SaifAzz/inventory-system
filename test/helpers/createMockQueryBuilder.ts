export function createMockQueryBuilder() {
  return {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    execute: jest.fn(),
  };
}

export function createMockRepository() {
  const queryBuilder = createMockQueryBuilder();

  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
}
