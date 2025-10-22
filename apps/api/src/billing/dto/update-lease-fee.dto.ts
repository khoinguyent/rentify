import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLeaseFeeDto } from './create-lease-fee.dto';

export class UpdateLeaseFeeDto extends PartialType(OmitType(CreateLeaseFeeDto, ['leaseId'])) {}

