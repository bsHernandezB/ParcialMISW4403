import { Module } from '@nestjs/common';
import { ProductoTiendaService } from './producto-tienda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity, TiendaEntity])],
  providers: [ProductoTiendaService],
})
export class ProductoTiendaModule {}
