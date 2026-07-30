import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ObesityRegister } from '../../obesity-register/entities/obesity-register.entity';

@Entity({
  name: 'obesity_weight_transaction',
})
@Index(
  'idx_obesity_weight_transaction_register_id',
  ['registerId'],
)
@Index(
  'idx_obesity_weight_transaction_patient_id',
  ['patientId'],
)
@Index(
  'idx_obesity_weight_transaction_weight_at',
  ['weightAt'],
)
export class ObesityWeightTransaction {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'transaction_id',
    primaryKeyConstraintName:
      'pk_obesity_weight_transaction',
  })
  transactionId!: string;

  @Column({
    name: 'register_id',
    type: 'bigint',
  })
  registerId!: string;

  @ManyToOne(
    () => ObesityRegister,
    {
      nullable: false,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'register_id',
    foreignKeyConstraintName:
      'fk_obesity_weight_transaction_register',
  })
  register!: ObesityRegister;

  @Column({
    name: 'patient_id',
    type: 'bigint',
  })
  patientId!: string;

  @Column({
    name: 'episode_id',
    type: 'bigint',
  })
  episodeId!: string;

  @Column({
    name: 'vn',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  vn?: string;

  @Column({
    name: 'height',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  height?: number;

  @Column({
    name: 'weight',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  weight?: number;

  @Column({
    name: 'bmi',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  bmi?: number;

  @Column({
    name: 'weight_at',
    type: 'timestamptz',
  })
  weightAt?: Date;

  @Column({
    name: 'is_weight_at_hospital',
    type: 'boolean',
    default: false,
  })
  isWeightAtHospital?: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt?: Date;
}
