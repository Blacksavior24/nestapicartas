import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFileuploadDto } from './dto/create-fileupload.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FileuploadService {
  
  getStaticProductImage ( imageName: string ){

    const path = join( __dirname, '../../files/', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException(`No existe el archivo`)
    }

    return path;
  }

}
