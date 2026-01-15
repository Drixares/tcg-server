import type { ApiPaginatedResponse } from "../types";

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationMeta {
    offset: number;
    limit: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parsePaginationParams(query: {
    page?: string;
    limit?: string;
}): PaginationParams {
    const page = Math.max(1, parseInt(query.page || String(DEFAULT_PAGE), 10));
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10)),
    );

    return { page, limit };
}

export function getPaginationMeta(params: PaginationParams): PaginationMeta {
    return {
        offset: (params.page - 1) * params.limit,
        limit: params.limit,
    };
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams,
): ApiPaginatedResponse<T> {
    return {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
        data,
    };
}
