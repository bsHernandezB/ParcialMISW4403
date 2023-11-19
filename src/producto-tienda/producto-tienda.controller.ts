/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ProductoTiendaService } from './producto-tienda.service';
import { TiendaDto } from '../tienda/tienda.dto/tienda.dto';
import { plainToInstance } from 'class-transformer';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {
    constructor(private readonly productotiendaService: ProductoTiendaService){}

    @Post(':productoId/tiendas/:tiendaId')
    async addStoreToProduct(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
        return await this.productotiendaService.addStoreToProduct(productoId, tiendaId);
    }

    @Get(':productoId/tiendas')
    async findStoresFromProduct(@Param('productoId') productoId: string){
        return await this.productotiendaService.findStoresFromProduct(productoId);
    }

    @Get(':productoId/tiendas/:tiendaId')
    async findStoreFromProduct(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
        return await this.productotiendaService.findStoreFromProduct(productoId, tiendaId);
    }

    @Put(':productoId/tiendas')
    async updateStoresFromProduct(@Body() tiendasDto: TiendaDto[], @Param('productoId') productoId: string){
        const tiendas = plainToInstance(TiendaEntity, tiendasDto)
        return await this.productotiendaService.updateStoresFromProduct(productoId, tiendas);
    }

    @Delete(':productoId/tiendas/:tiendaId')
    @HttpCode(204)
    async deleteStoreFromProduct(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
        return await this.productotiendaService.deleteStoreFromProduct(productoId, tiendaId);
    }
}
