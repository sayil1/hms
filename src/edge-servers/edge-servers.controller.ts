import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { EdgeServersService } from './edge-servers.service';
import { CreateEdgeServerDto } from './dto/create-edge-server.dto';
import * as XLSX from 'xlsx';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ref_values } from '../util/util-data/reference-values';
import { testInputs } from './dto/test.input';

@ApiTags('edge-servers')
@Controller('edge-servers')
export class EdgeServersController {
  constructor(private readonly edgeServersService: EdgeServersService) {}

  @Post()
  create(@Body() createEdgeServerDto: any) {
    return this.edgeServersService.checkHealthParameter(
      25,
      'male',
      'heart_rate',
      { main: 105 },
    );
  }

  @Post('test')
  createInputTest() {
    return this.edgeServersService.runtest(testInputs);
  }

  @Post('upload-excel')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data: any = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array

    try {
      return {
        data: 'processedData',
      };
    } catch (error) {
      return {
        message: 'Error in processing uploaded data',
      };
    }
  }
}
