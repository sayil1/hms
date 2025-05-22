import { PartialType } from '@nestjs/mapped-types';
import { CreateEdgeServerDto } from './create-edge-server.dto';

export class UpdateEdgeServerDto extends PartialType(CreateEdgeServerDto) {}
