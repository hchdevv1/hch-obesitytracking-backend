import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObesityRegister } from '../../obesity-register/entities/obesity-register.entity';


@Entity({
  name: 'obesity_weight_transaction',
})

@Index(
  'idx_obesity_weight_transaction_patient_id',
  ['patientId'],
)
@Index(
  'idx_obesity_weight_transaction_hn',
  ['hn'],
)
@Index(
  'idx_obesity_weight_transaction_weight_at',
  ['weightAt'],
)
@Index(
  'uk_obesity_weight_transaction_register_weight_at',
  ['registerId', 'weightAt'],
  {
    unique: true,
  },
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
    name: 'hn',
    type: 'varchar',
    length: 20,
  })
  hn!: string;

  @Column({
    name: 'episode_id',
    type: 'bigint',
      nullable: true,
  })
  episodeId?: string;

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

 @UpdateDateColumn({
  name: 'updated_at',
  type: 'timestamptz',
  nullable: true,
})
updatedAt?: Date;
}
