import { PartialType } from '@nestjs/swagger';
import { CreateLeaseDto } from './create-lease.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { LeaseStatus } from '@prisma/client';

export class UpdateLeaseDto extends PartialType(CreateLeaseDto) {
  @ApiProperty({ example: 'ACTIVE', enum: LeaseStatus, required: false })
  @IsOptional()
  @IsEnum(LeaseStatus)
  status?: LeaseStatus;
}

