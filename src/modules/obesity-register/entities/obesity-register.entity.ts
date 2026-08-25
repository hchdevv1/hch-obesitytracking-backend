import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObesityWeightTransaction } from '../../obesity-weight-transaction/entities/obesity-weight-transaction.entity';

@Entity({
  name: 'obesity_register',
})
@Index('uq_obesity_register_patient_id', ['patientId'], {
  unique: true,
})
@Index('uq_obesity_register_obesity_number', ['obesityNumber'], {
  unique: true,
})
@Index('uq_obesity_register_user_id', ['userId'], {
  unique: true,
})
export class ObesityRegister {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'register_id',
    primaryKeyConstraintName: 'pk_obesity_register',
  })
  registerId!: string;

  @Column({
    name: 'patient_id',
    type: 'bigint',
  })
  patientId?: string;

  @Column({
    name: 'obesity_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  obesityNumber?: string | null;

  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 100,
  })
  userId?: string;

  @Column({
    name: 'hn',
    type: 'varchar',
    length: 20,
  })
  hn?: string;

  @Column({
    name: 'fullname',
    type: 'varchar',
    length: 200,
  })
  fullname?: string;

  @Column({
    name: 'gender',
    type: 'char',
    length: 1,
  })
  gender?: string;

  @Column({
    name: 'dob',
    type: 'date',
  })
  dob?: Date;

  @Column({
    name: 'baseline_height',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  baselineHeight?: number;

  @Column({
    name: 'baseline_weight',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  baselineWeight?: number;

  @Column({
    name: 'baseline_bmi',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  baselineBmi?: number;
  @Column({
  name: 'baseline_date',
  type: 'date',
  nullable: true,
})
baselineDate?: Date;

  @Column({
    name: 'surgery_status',
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  surgeryStatus?: string;

  @Column({
    name: 'surgery_approved_at',
    type: 'timestamptz',
    nullable: true,
  })
  surgeryApprovedAt?: Date;

  @Column({
    name: 'is_cancelled',
    type: 'boolean',
    default: false,
  })
  isCancelled?: boolean;

  @Column({
    name: 'is_preauthorized',
    type: 'boolean',
    default: false,
  })
  isPreauthorized?: boolean;

  @Column({
    name: 'is_operation_scheduled',
    type: 'boolean',
    default: false,
  })
  isOperationScheduled?: boolean;

  @Column({
    name: 'is_baseline_accepted',
    type: 'boolean',
    default: false,
  })
  isBaselineAccepted?: boolean;

  @Column({
  name: 'is_success',
  type: 'boolean',
  default: false,
})
isSuccess?: boolean;

@Column({
  name: 'success_date',
  type: 'timestamptz',
  nullable: true,
})
successDate?: Date;

@Column({
  name: 'is_request_preauthorized',
  type: 'boolean',
  default: false,
})
isRequestPreauthorized?: boolean;


  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @OneToMany(
    () => ObesityWeightTransaction,
    (weightTransaction) => weightTransaction.register,
  )
  weightTransactions!: ObesityWeightTransaction[];
}
