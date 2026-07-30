/* eslint-disable prettier/prettier */
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { BaseResponseDto } from '../dto/base-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';

interface ApiResponseOptions {
  isArray?: boolean;
  isPagination?: boolean;
}

export function ApiBaseResponse<TModel extends Type<unknown>>(
  model: TModel,
  options: ApiResponseOptions = {},
) {
  const { isArray = false, isPagination = false } = options;

  if (isPagination) {
    return applyDecorators(
      ApiExtraModels(
        BaseResponseDto,
        model,
        PaginationMetaDto,
      ),
      ApiOkResponse({
        schema: {
          allOf: [
            {
              $ref: getSchemaPath(BaseResponseDto),
            },
            {
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(model),
                      },
                    },
                    meta: {
                      $ref: getSchemaPath(
                        PaginationMetaDto,
                      ),
                    },
                  },
                },
              },
            },
          ],
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(BaseResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(BaseResponseDto),
          },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: {
                      $ref: getSchemaPath(model),
                    },
                  }
                : {
                    $ref: getSchemaPath(model),
                  },
            },
          },
        ],
      },
    }),
  );
}
