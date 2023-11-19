/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TiendaService } from './tienda.service';
import { faker } from '@faker-js/faker';
import { TiendaEntity } from './tienda.entity/tienda.entity';

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendasList: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    tiendasList = [];
    for(let i = 0; i < 5; i++){
        const tienda: TiendaEntity = await repository.save({
        nombre: faker.string.alpha(), 
        ciudad: faker.string.alpha(3), 
        direccion: faker.string.alpha()})
        tiendasList.push(tienda);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todas las tiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(tiendasList.length);
  });

  it('findOne debe retornar una tienda por su identificador', async () => {
    const storedTienda: TiendaEntity = tiendasList[0];
    const tienda: TiendaEntity = await service.findOne(storedTienda.id);
    expect(tienda).not.toBeNull();
    expect(tienda.nombre).toEqual(storedTienda.nombre)
    expect(tienda.ciudad).toEqual(storedTienda.ciudad)
    expect(tienda.direccion).toEqual(storedTienda.direccion)
  });

  it('findOne debe lanzar una excepcion por una tienda con un identificador invalido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada")
  });

  it('create debe retornar una nueva tienda', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.string.alpha(), 
      ciudad: faker.string.alpha(3), 
      direccion: faker.string.alpha(),
      productos: []
    }

    const newTienda: TiendaEntity = await service.create(tienda);
    expect(newTienda).not.toBeNull();

    const storedTienda: TiendaEntity = await repository.findOne({where: {id: newTienda.id}})
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toEqual(newTienda.nombre)
    expect(storedTienda.ciudad).toEqual(newTienda.ciudad)
    expect(storedTienda.direccion).toEqual(newTienda.direccion)
  });

  it('create debe lanzar una excepcion por una tienda con un codigo de ciudad invalido', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.string.alpha(), 
      ciudad: faker.string.alpha(4), 
      direccion: faker.string.alpha(),
      productos: []
    }
    await expect(() => service.create(tienda)).rejects.toHaveProperty("message", "El codigo de la ciudad no tiene el formato correcto, debe ser un codigo de tres caracteres")
  });

  it('update debe actualizar una tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "New name";
    tienda.direccion = "Cra 13";
  
    const updatedTienda: TiendaEntity = await service.update(tienda.id, tienda);
    expect(updatedTienda).not.toBeNull();
  
    const storedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toEqual(tienda.nombre)
    expect(storedTienda.direccion).toEqual(tienda.direccion)
  });

  it('update debe lanzar una excepcion por una tienda con un identificador invalido', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda, nombre: "New name", direccion: "Cra 13"
    }
    await expect(() => service.update("0", tienda)).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada")
  });

  it('update debe lanzar una excepcion por una tienda con un codigo de ciudad invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "New name";
    tienda.direccion = "Cra 13";
    tienda.ciudad = faker.string.alpha(4);
    await expect(() => service.update(tienda.id, tienda)).rejects.toHaveProperty("message", "El codigo de la ciudad no tiene el formato correcto, debe ser un codigo de tres caracteres")
  });

  it('delete debe borrar una tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);
  
    const deletedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(deletedTienda).toBeNull();
  });

  it('delete debe lanzar una excepcion por una tienda con un identificador invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "La tienda  con el id proporcionado no fue encontrada")
  });
});
