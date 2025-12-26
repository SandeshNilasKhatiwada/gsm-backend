// Pagination utility
export const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  return {
    skip,
    take: limitNum,
    page: pageNum,
    limit: limitNum,
  };
};

// Pagination response
export const paginationResponse = (data, total, page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / limitNum);

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};
