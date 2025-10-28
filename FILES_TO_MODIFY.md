# 📝 Manual Modification Guide

If you deploy using the source archive, you need to modify these 2 files manually:

---

## File 1: `src/app.module.ts`

**Location:** Line 11, after other imports

### ADD THIS LINE:
```typescript
import { EventsModule } from './modules/events/events.module';
```

**Location:** Line 33, in the imports array

### ADD THIS LINE:
```typescript
    EventsModule,
```

### Complete Modified Section:
```typescript
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    StockModule,
    TestDriveModule,
    StaffModule,
    LineIntegrationModule,
    EventsModule,  // ← ADD THIS
  ],
})
```

---

## File 2: `src/modules/stock/entities/vehicle.entity.ts`

### Change 1: Update VehicleStatus enum (Line 5-9)

**FROM:**
```typescript
export enum VehicleStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  IN_USE = 'in_use'
}
```

**TO:**
```typescript
export enum VehicleStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',           // ← ADD THIS
  LOCKED_FOR_EVENT = 'locked_for_event', // ← ADD THIS
}
```

### Change 2: Add event-related fields (After testDrives property, before createdAt)

**ADD THESE LINES:**
```typescript
  // Event-related fields
  @Column({ type: 'boolean', default: false })
  isLockedForEvent: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  currentEventId: string;

  @Column({ type: 'datetime', nullable: true })
  eventLockStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  eventLockEndDate: Date;
```

### Complete Modified Section:
```typescript
  // เพิ่มความสัมพันธ์กับ TestDrive
  @OneToMany(() => TestDrive, testDrive => testDrive.vehicle)
  testDrives: TestDrive[];

  // Event-related fields ← ADD FROM HERE
  @Column({ type: 'boolean', default: false })
  isLockedForEvent: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  currentEventId: string;

  @Column({ type: 'datetime', nullable: true })
  eventLockStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  eventLockEndDate: Date;
  // ← TO HERE

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

---

## ✅ Verification

After making these changes:

1. **Check imports:**
   ```bash
   grep "EventsModule" src/app.module.ts
   ```
   Should show: `import { EventsModule } ...` and `EventsModule,`

2. **Check enum:**
   ```bash
   grep "LOCKED_FOR_EVENT" src/modules/stock/entities/vehicle.entity.ts
   ```
   Should show: `LOCKED_FOR_EVENT = 'locked_for_event',`

3. **Build:**
   ```bash
   npm run build
   ```
   Should succeed without errors

---

## 🎯 Quick Checklist

- [ ] Add `EventsModule` import to `app.module.ts`
- [ ] Add `EventsModule` to imports array
- [ ] Add `MAINTENANCE` to `VehicleStatus` enum
- [ ] Add `LOCKED_FOR_EVENT` to `VehicleStatus` enum
- [ ] Add 4 event-related fields to `Vehicle` entity
- [ ] Run `npm run build` to verify
- [ ] Run `npm run migration:run` to update database

---

**Note:** If you use the git bundle method, these changes are already included!
