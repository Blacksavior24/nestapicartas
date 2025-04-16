import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFileuploadDto } from './dto/create-fileupload.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FileuploadService {
  private readonly logger = new Logger(FileuploadService.name)
  getStaticProductImage ( imageName: string ){

    const path = join( __dirname, '../../files/', imageName);

    console.log("path finaly", path)
    this.logger.log(`path finaly ${path}`)
    if (!existsSync(path)) {
      throw new BadRequestException(`No existe el archivo`)
    }

    return path;
  }

}
