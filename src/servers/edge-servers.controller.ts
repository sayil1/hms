import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EdgeServersService } from './edge-servers.service';
import * as XLSX from 'xlsx';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { testInputs } from './dto/test.input';
import { transformData } from './dto/xlsdatatojson';

@ApiTags('edge-servers')
@Controller('edge-servers')
export class EdgeServersController {
  constructor(private readonly edgeServersService: EdgeServersService) { }

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

    const xlsdata: any = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array
    const data = transformData(xlsdata);
    console.log(data, "data from excel file");

    try {
      return this.edgeServersService.runtest(data);
    } catch (error) {
      console.log(error, "error")
      return {
        message: 'Error in processing uploaded data',
      };
    }
  }
}
