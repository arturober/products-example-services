import { EntityRepository } from '@mikro-orm/mariadb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { Product } from 'src/entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    private imgService: ImageService,
  ) {}

  getProducts(search: string): Promise<Product[]> {
    console.log(search);
    return search
      ? this.productRepo.find({ description: { $like: `%${search}%` } })
      : this.productRepo.findAll();
  }

  async getProduct(id: number) {
    const prod = await this.productRepo.findOne(id);
    if (!prod) {
      throw new NotFoundException({
        status: 404,
        error: 'Product not found',
      });
    }
    return prod;
  }

  async insertProduct(prodDto: CreateProductDto) {
    const prod = Product.fromDto(prodDto);
    prod.imageUrl = await this.imgService.saveImage('', prod.imageUrl);
    await this.productRepo.getEntityManager().persistAndFlush(prod);
    return prod;
  }

  async updateProduct(id: number, prodDto: CreateProductDto) {
    const prod = await this.productRepo.findOne(id);
    if (!prod) {
      throw new NotFoundException({
        status: 404,
        error: 'Product not found',
      });
    }
    if (!prodDto.imageUrl.startsWith('http')) {
      prod.imageUrl = await this.imgService.saveImage('', prodDto.imageUrl);
    }
    prod.description = prodDto.description;
    prod.price = prod.price;
    await this.productRepo.getEntityManager().flush();
    return prod;
  }

  async deleteProduct(id) {
    const prod = await this.productRepo.findOne(id);
    if (!prod) {
      throw new NotFoundException({
        status: 404,
        error: 'Product not found',
      });
    }
    return this.productRepo.getEntityManager().removeAndFlush(prod);
  }

  async updateRating(id: number, rating: UpdateRatingDto) {
    const prod = await this.productRepo.findOne(id);
    if (!prod) {
      throw new NotFoundException({
        status: 404,
        error: 'Product not found',
      });
    }
    prod.rating = rating.rating;
    await this.productRepo.getEntityManager().persistAndFlush(prod);
  }
}
