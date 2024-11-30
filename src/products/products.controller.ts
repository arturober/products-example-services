import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private configService: ConfigService,
  ) {}

  @Get('')
  async getProducts(
    @Req() req: Request,
    @Query('search', new DefaultValuePipe(null))
    search?: string,
  ) {
    const products = await this.productsService.getProducts(search);
    return {
      products: products.map((p) => {
        p.imageUrl =
          req.protocol +
          '://' +
          req.headers.host +
          '/' +
          this.configService.get<string>('basePath') +
          p.imageUrl;
        return p;
      }),
    };
  }

  @Get(':id')
  async getProduct(@Param('id') id, @Req() req: Request) {
    const product = await this.productsService.getProduct(id);
    product.imageUrl =
      req.protocol +
      '://' +
      req.headers.host +
      '/' +
      this.configService.get<string>('basePath') +
      product.imageUrl;
    return { product };
  }

  @Post('')
  async postProduct(
    @Body(new ValidationPipe({ transform: true })) prodDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const product = await this.productsService.insertProduct(prodDto);
    product.imageUrl =
      req.protocol +
      '://' +
      req.headers.host +
      '/' +
      this.configService.get<string>('basePath') +
      product.imageUrl;
    return { product };
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id,
    @Body(new ValidationPipe({ transform: true })) prodDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const product = await this.productsService.updateProduct(id, prodDto);
    product.imageUrl =
      req.protocol +
      '://' +
      req.headers.host +
      '/' +
      this.configService.get<string>('basePath') +
      product.imageUrl;
    return { product };
  }

  @Delete(':id')
  @HttpCode(204)
  async removeProduct(@Param('id') id) {
    await this.productsService.deleteProduct(id);
  }

  @Put(':id/rating')
  async updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) rating: UpdateRatingDto,
  ) {
    await this.productsService.updateRating(id, rating);
    return { rating: rating.rating };
  }
}
