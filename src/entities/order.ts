import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column()
  transactionId!: string;

  @Column()
  productId!: number;
}