/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoTiendaService } from './producto-tienda.service';
import { ProductoEntity } from '../producto/producto.entity/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendasList : TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    tiendaRepository.clear();
    productoRepository.clear();
 
    tiendasList = [];
    for(let i = 0; i < 5; i++){
        const tienda: TiendaEntity = await tiendaRepository.save({
          nombre: faker.string.alpha(),
          ciudad: faker.string.alpha(3),
          direccion: faker.string.alpha()
        })
        tiendasList.push(tienda);
    }
 
    producto = await productoRepository.save({
      nombre: faker.string.alpha(), 
      precio: faker.number.int(), 
      tipo: 'Perecedero',
      tiendas: tiendasList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct debe asociar una tienda a un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.string.alpha(), 
      precio: faker.number.int(), 
      tipo: 'Perecedero'
    })

    const result: ProductoEntity = await service.addStoreToProduct(newProducto.id, newTienda.id);
    
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre)
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad)
    expect(result.tiendas[0].direccion).toBe(newTienda.direccion)
  });

  it('addStoreToProduct deberia lanzar una excepcion por una tienda con un identificador invalido', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.string.alpha(), 
      precio: faker.number.int(), 
      tipo: 'Perecedero'
    })

    await expect(() => service.addStoreToProduct(newProducto.id, "0")).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada");
  });

  it('addStoreToProduct deberia lanzar una excepcion por un producto con un identificador invalido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    await expect(() => service.addStoreToProduct("0", newTienda.id)).rejects.toHaveProperty("message", "El producto  con el id proporcionado no fue encontrado");
  });

  it('findStoreFromProduct debe regresar una tienda que tiene un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    const storedTienda: TiendaEntity = await service.findStoreFromProduct(producto.id, tienda.id);
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(tienda.nombre);
    expect(storedTienda.ciudad).toBe(tienda.ciudad);
    expect(storedTienda.direccion).toBe(tienda.direccion);
  });

  it('findStoreFromProduct deberia lanzar una excepcion por una tienda con un identificador invalido', async () => {
    await expect(()=> service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada"); 
  });

  it('findStoreFromProduct deberia lanzar una excepcion por un producto con un identificador invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0]; 
    await expect(()=> service.findStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "El producto  con el id proporcionado no fue encontrado"); 
  });

  it('findStoreFromProduct deberia lanzar una excepcion por una tienda que con el id proporcionado no esta asociada a un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    await expect(()=> service.findStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message", "La tienda con el id proporcionado no esta asociada al producto"); 
  });

  it('findStoresFromProduct debe regresar las tiendas que tienen un producto', async ()=>{
    const tiendas: TiendaEntity[] = await service.findStoresFromProduct(producto.id);
    expect(tiendas.length).toBe(5)
  });

  it('findStoresFromProduct deberia lanzar una excepcion por un producto con un identificador invalido', async () => {
    await expect(()=> service.findStoresFromProduct("0")).rejects.toHaveProperty("message", "El producto  con el id proporcionado no fue encontrado"); 
  });

  it('updateStoresFromProduct debe actualizar las tiendas que tienen un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    const updatedProducto: ProductoEntity = await service.updateStoresFromProduct(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);

    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
  });

  it('updateStoresFromProduct deberia lanzar una excepcion por un producto con un identificador invalido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    await expect(()=> service.updateStoresFromProduct("0", [newTienda])).rejects.toHaveProperty("message", "El producto  con el id proporcionado no fue encontrado"); 
  });

  it('updateStoresFromProduct deberia lanzar una excepcion por una tienda con un identificador invalido', async () => {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = "0";

    await expect(()=> service.updateStoresFromProduct(producto.id, [newTienda])).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada"); 
  });

  it('deleteStoreFromProduct debe eliminar la tienda que tiene un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    
    await service.deleteStoreFromProduct(producto.id, tienda.id);

    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(a => a.id === tienda.id);

    expect(deletedTienda).toBeUndefined();

  });

  it('deleteStoreFromProduct deberia lanzar una excepcion por una tienda con un identificador invalido', async () => {
    await expect(()=> service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada"); 
  });

  it('deleteStoreFromProduct deberia lanzar una excepcion por un producto con un identificador invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.deleteStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "El producto  con el id proporcionado no fue encontrado"); 
  });

  it('deleteStoreFromProduct deberia lanzar una excepcion por una tienda que con el id proporcionado no esta asociada a un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.string.alpha(),
      ciudad: faker.string.alpha(3),
      direccion: faker.string.alpha()
    });

    await expect(()=> service.deleteStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message", "La tienda con el id proporcionado no esta asociada al producto"); 
  });
});
