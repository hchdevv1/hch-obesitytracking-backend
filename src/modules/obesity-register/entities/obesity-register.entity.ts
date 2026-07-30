import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  })
  obesityNumber?: string;

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
}
